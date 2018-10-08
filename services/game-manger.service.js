((app) => {
  const rand = limit => Math.floor(Math.random() * limit);
  
  /**
   * Generates a new pattern.
   * 
   * @param {number} rows Rows limit
   * @param {number} cols Cols limit
   * @param {number} patternLength The lenght of the patter
   * @returns {Array}
   */
  function generatePattern(rows, cols, patternLength) {
    let done = false;
    const pattern = [];

    while (!done) {
      const tileIndex = rand(rows * cols) + 1;
      if (pattern.indexOf(tileIndex) === -1) {
        pattern.push(tileIndex);
      }

      if (pattern.length === patternLength) {
        done = true;
      }
    }

    return pattern;
  }

  const DIFFICULTY_LEVELS = {
    EASY: 'EASY',
    NORMAL: 'NORMAL',
    HARD: 'HARD'
  };

  const LOGIC_EVENTS = {
    INIT: 'INIT',
    SHOW_PATTERN: 'SHOW_PATTERN',
    START_ROUND: 'START_ROUND',
    LOSE: 'LOSE',
    HALT: 'HALT'
  };

  const STATE = {
    INIT: 'INIT',
    DRAW_ROUND: 'DRAW_ROUND',
    START_ROUND: 'START_ROUND',
    IN_PROGESS: 'IN_PROGESS',
    HALT: 'HALT',
    WIN: 'WIN',
    LOSE: 'LOSE',
  };

  /**
   * Class responsible for controlling all the game logic
   * and state management.
   * @class
   */
  class GameManager {

    constructor(timeManager) {
      this.levelConfig = {};

      this.boardState = {
        tiles: [],
        pattern: [],
        guess: []
      };

      this.state = null;
      this.timeManager = timeManager;

      this._initLevelConfig();
    }

    /**
     * Seed the tiles for the first time.
     * 
     * @public
     */
    init() {
      this.setState(STATE.INIT);
    }

    /**
     * Emit a new game event for the external components.
     * 
     * @private
     * @param {string} event Game event
     * @param {any} payload Event payload
     */
    _emit(event, payload) {
      this.onEventCallback(event, payload);
    }
    
    /**
     * Register the event listener for the game events.
     * 
     * @public
     * @param {Function} callback 
     */
    on(callback) {
      this.onEventCallback = callback;
    }

    /**
     * Register a callback for the timers events.
     * 
     * @public
     * @param {Function} callback 
     */
    onTime(callback) {
      this.onTimeCallback = callback;
    }

    /**
     * Initialize the configuration for the easy level.
     * It's also used to reset the level configuration.
     */
    _initLevelConfig() {
      this.level = DIFFICULTY_LEVELS.EASY;
      this.setLevelConfig({
        rows: 3,
        cols: 3,
        patternLength: 3,
        guessTime: 5000,
        patternTime: 2000,
        nextRoundTime: 2000
      });
    }

    /**
     * Set the level configuration along with the default properties.
     * 
     * @private
     * @param {Object} config Level configuration
     */
    setLevelConfig(config) {
      this.levelConfig = Object.assign({}, this.levelConfig, config);
    }

    /**
     * Set the current difficulty level and reload the game
     * accordingly with that level.
     * 
     * @public
     * @param {string} level Game level
     */
    setLevel(level) {
      switch (level) {
        case DIFFICULTY_LEVELS.EASY:
          this._initLevelConfig();
          break;

        case DIFFICULTY_LEVELS.NORMAL:
          this._initLevelConfig();
          this.setLevelConfig({patternLength: 4});
          break;
        
        case DIFFICULTY_LEVELS.HARD:
          this._initLevelConfig();
          this.setLevelConfig({
            patternLength: 5,
            guessTime: 5000,
            nextRoundTime: 1000,
            patternTime: 2500,
            rows: 4,
            cols: 4
          });
          break;
      }

      this.level = level;
      this.start();
    }

    /**
     * Set the state of the application, handle the actions related
     * to that state.
     * This is the only place that will update the application state: tiles etc.
     * 
     * @public
     * @param {string} state Application state.
     */
    setState(state) {
      this.state = state;

      switch(state) {
        case STATE.INIT:
          this._seedTiles();
          this._emit(LOGIC_EVENTS.INIT, this.boardState.tiles);
          this.setState(STATE.HALT);
          break;

        case STATE.DRAW_ROUND:
          this._generateRound();
          const pattern = [...this.boardState.pattern];
          const deltaInterval = 100 / this.levelConfig.patternLength;
          let patternIndex = 0;

          this._startTimer(
            this.levelConfig.patternTime,
            'pattern',
            () => this.setState(STATE.START_ROUND),
            percent => {
              const displayTreshold = deltaInterval * patternIndex;
  
              if (percent >= displayTreshold && patternIndex < this.levelConfig.patternLength) {
                this._emit(LOGIC_EVENTS.SHOW_PATTERN, [pattern.shift()])
                patternIndex++;
              }
            }
          );
          break;

        case STATE.START_ROUND:
          this.setState(STATE.IN_PROGESS);
          this._emit(LOGIC_EVENTS.START_ROUND);
          break;

        case STATE.IN_PROGESS:
          this._startTimer(
            this.levelConfig.guessTime,
            'time left',
            () => this.setState(STATE.LOSE)
          );
          break;

        case STATE.WIN:
          this.timeManager.stop();
          this._startTimer(
            this.levelConfig.nextRoundTime,
            'next round',
            () => this.setState(STATE.DRAW_ROUND)
          );
          this.setState(STATE.HALT);
          break;

        case STATE.LOSE:
          this.timeManager.stop();
          this.setState(STATE.HALT);
          this._emit(LOGIC_EVENTS.LOSE);
          break;
        
        case STATE.HALT:
            this._emit(LOGIC_EVENTS.HALT);
            break;
      }
    }

    /**
     * Generate a new set of tiles.
     * 
     * @private
     */
    _seedTiles() {
      const { rows, cols } = this.levelConfig;
      let incrementor = 1;
  
      this.boardState.tiles = Array(rows).fill(0).map(
        _ => Array(cols).fill(0).map(_ => incrementor++)
      );
    }
    
    /**
     * Check the current status of the game if the user win or lose.
     * 
     * @private
     */
    _checkStatus() {
      const { guess, pattern } = this.boardState;
      if (guess.length !== pattern.length) return;
      
      const state = guess.every((value, index) => pattern[index] === value) ?
        STATE.WIN :  STATE.LOSE;

      this.setState(state);
    }

    /**
     * Generate a new round.
     * 
     * @private
     */
    _generateRound() {
      const { rows, cols, patternLength } = this.levelConfig;

      this.boardState.guess = [];
      this.boardState.pattern = generatePattern(rows, cols, patternLength);
    }
    
    /**
     * Return the curent state of the tiles.
     * 
     * @public
     * @returns {Array}
     */
    getTiles() {
      return this.boardState.tiles;
    }

    /**
     * Return all the available difficultie levels.
     * 
     * @public
     * @returns {Array}
     */
    getDifficultyLevels() {
      return Object.keys(DIFFICULTY_LEVELS)
        .map(key => DIFFICULTY_LEVELS[key]);
    }

    /**
     * Sets the guess tile form the user only once.
     * 
     * @public
     * @param {number} value Tile value
     */
    setTile(value) {
      if (
        this.state !== STATE.IN_PROGESS ||
        this.boardState.guess.indexOf(value) !== -1
      ) return;

      this.boardState.guess.push(value);
      this._checkStatus();
    }
    
    /**
     * Sets a `deadline` for the user or for an action.
     * Also emits this value along with the reason for the deadline.
     * 
     * @private
     * @param {number} duration Timer duration until finish
     * @param {string} label Emit this label to external components
     * @param {Function} actionCallback Called after the timer will finish
     */
    _startTimer(duration, label, doneCallback, callback) {
      this.timeManager.start((percent) => {
        if (percent === null) {
          doneCallback();
        }
        if (callback) {
          callback(percent);
        }
        this.onTimeCallback(label, percent);
      }, duration)
    }

    /**
     * Start the rounds based on the current difficulty level.
     * 
     * @public
     */
    start() {
      this.setState(STATE.INIT);
      this.setState(STATE.DRAW_ROUND);
    }
  }

  app.GameManager = GameManager;
  app.LOGIC_EVENTS = LOGIC_EVENTS;
})(window.app);