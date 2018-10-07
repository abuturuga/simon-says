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
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard'
  };

  const LOGIC_EVENTS = {
    INIT: 'INIT',
    SHOW_PATTERN: 'SHOW_PATTERN',
    START_ROUND: 'START_ROUND',
    LOSE: 'LOSE',
    HALT: 'HALT'
  };

  const STATE = {
    INIT: 'init',
    DRAW_ROUND: 'draw-round',
    START_ROUND: 'start-round',
    IN_PROGESS: 'inprogress',
    HALT: 'halt',
    WIN: 'win',
    LOSE: 'lose',
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
      this.setLevel(DIFFICULTY_LEVELS.EASY);
    }
    
    init() {
      this.setState(STATE.INIT);
    }

    _emit(event, payload) {
      this.onEventCallback(event, payload);
    }
    
    on(callback) {
      this.onEventCallback = callback;
    }

    onTime(callback) {
      this.onTimeCallback = callback;
    }

    _initLevelConfig() {
      this.setLevelConfig({
        rows: 3,
        cols: 3,
        patternLength: 3,
        guessTime: 5000,
        patternTime: 2000,
        nextRoundTime: 2000
      });
    }

    setLevelConfig(config) {
      this.levelConfig = Object.assign({}, this.levelConfig, config);
    }

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
          this.setState(STATE.INIT);
          break;
      }

      this.level = level;
    }

    setState(state) {
      this.state = state;

      switch(state) {
        case STATE.INIT:
          this._seedTiles();
          this._emit(LOGIC_EVENTS.INIT, this.boardState.tiles);
          this.setState(STATE.HALT);
          break;

        case STATE.DRAW_ROUND:
          this.generateRound();
          this._startTimer(
            this.levelConfig.patternTime,
            'pattern',
            () => this.setState(STATE.START_ROUND)
          );
          this._emit(LOGIC_EVENTS.SHOW_PATTERN, this.boardState.pattern);
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
      }
    }

    _seedTiles() {
      const { rows, cols } = this.levelConfig;
      let incrementor = 1;
  
      this.boardState.tiles = Array(rows).fill(0).map(
        _ => Array(cols).fill(0).map(_ => incrementor++)
      );
    }
  
    _checkStatus() {
      const { guess, pattern } = this.boardState;
      if (guess.length !== pattern.length) return;
      
      const sum = (acumulator, element) => acumulator + element;
      const guessSum = guess.reduce(sum, 0);
      const patternSum = pattern.reduce(sum, 0);
      
      const state = (guessSum === patternSum)
        ? STATE.WIN : STATE.LOSE;

      this.setState(state);
    }

    generateRound() {
      const { rows, cols, patternLength } = this.levelConfig;

      this.boardState.guess = [];
      this.boardState.pattern = generatePattern(rows, cols, patternLength);
    }
  
    getTiles() {
      return this.boardState.tiles;
    }

    getDifficultyLevels() {
      return Object.keys(DIFFICULTY_LEVELS)
        .map(key => DIFFICULTY_LEVELS[key]);
    }

    setTile(value) {
      if (this.state !== STATE.IN_PROGESS) return;

      this.boardState.guess.push(value);
      this._checkStatus();
    }

    _startTimer(duration, label, actionCallback) {
      this.timeManager.start((percent) => {
        if (percent === null) {
          actionCallback();
        }

        this.onTimeCallback(label, percent);
      }, duration)
    }

    start() {
      if (this.state !== STATE.HALT) return;

      this.setState(STATE.DRAW_ROUND);
    }
  }

  app.GameManager = GameManager;
  app.LOGIC_EVENTS = LOGIC_EVENTS;
})(window.app);