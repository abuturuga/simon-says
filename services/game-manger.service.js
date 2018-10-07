((app) => {
  const rand = limit => Math.floor(Math.random() * limit);
  
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
      this.tilesConfig = {
        rows: 3,
        cols: 3
      };
  
      this.state = null;
  
      this.round = 0;
      this.tiles = [];
      this.pattern = [];
      this.guess = [];
  
      this.timeManager = timeManager;
    }
    
    init() {
      this.setState(STATE.INIT);
    }

    emit(event, payload) {
      this.onEventCallback(event, payload);
    }
    
    on(callback) {
      this.onEventCallback = callback;
    }

    onTime(callback) {
      this.onTimeCallback = callback;
    }

    setState(state) {
      this.state = state;

      switch(state) {
        case STATE.INIT:
          this.seedTiles();
          this.emit(LOGIC_EVENTS.INIT, this.tiles);
          this.setState(STATE.HALT);
          break;
        case STATE.DRAW_ROUND:
          this.generateRound();
          this.startTimer(2000, 'pattern', () => this.setState(STATE.START_ROUND));
          this.emit(LOGIC_EVENTS.SHOW_PATTERN, this.pattern);
          break;
        case STATE.START_ROUND:
          this.setState(STATE.IN_PROGESS);
          this.emit(LOGIC_EVENTS.START_ROUND);
          break;
        case STATE.IN_PROGESS:
          this.startTimer(5000, 'time left', () => this.setState(STATE.LOSE));
          break;
        case STATE.WIN:
          this.timeManager.stop();
          this.startTimer(2000, 'next round', () => this.setState(STATE.DRAW_ROUND));
          this.setState(STATE.HALT);
          break;
        case STATE.LOSE:
          this.timeManager.stop();
          this.setState(STATE.HALT);
          this.emit(LOGIC_EVENTS.LOSE);
          break;
      }
    }

    seedTiles() {
      const { rows, cols } = this.tilesConfig;
      let incrementor = 1;
  
      this.tiles = Array(rows).fill(0).map(
        _ => Array(cols).fill(0).map(_ => incrementor++)
      );
    }
  
    checkStatus() {
      const { guess, pattern } = this;
      if (guess.length !== pattern.length) return;
      
      const sum = (acumulator, element) => acumulator + element;
      const guessSum = guess.reduce(sum, 0);
      const patternSum = pattern.reduce(sum, 0);
      
      const state = (guessSum === patternSum)
        ? STATE.WIN : STATE.LOSE;

      this.setState(state);
    }

    generateRound() {
      this.guess = [];
      this.seedPattern();
    }
  
    onRoundSolved() {
      this.state = STATE.HALT;
      this.onEventCallback(LOGIC_EVENTS.HALT);

    }
  
    seedPattern() {
      let done = false;
      this.pattern = [];

      while (!done) {
        const tile = rand(9) + 1;
        if (this.pattern.indexOf(tile) === -1) {
          this.pattern.push(tile);
        }
  
        if (this.pattern.length > 2) {
          done = true;
        }
      }
    }
  
    getTiles() {
      return this.tiles;
    }

    setTile(value) {
      if (this.state !== STATE.IN_PROGESS) return;

      this.guess.push(value);
      this.checkStatus();
    }

    startTimer(duration, label, actionCallback) {
      this.timeManager.start((percent) => {
        if (percent === null) {
          actionCallback();
        }
        console.log('here');
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