((app) => {

  const DIFFICULTY_SELECTOR_CLASS = 'difficulty-selector';

  class AppComponent {

    constructor() {
      this.$root = null;
      this.$startBtn = null;
      this.$gameCanvas = null;
      this.$timerBar = null;

      const { GameManager, TimeManager } = app;
      this.gameManager = new GameManager(new TimeManager());
    }

    extractElements() {
      this.$startBtn = document.querySelector('#start-btn');
      this.$timerBar = document.querySelector('#timer-bar');
      this.$gameCanvas = document.querySelector('#game-canvas');
      this.$difficultySelector = document.querySelector(`.${DIFFICULTY_SELECTOR_CLASS}`);
    }

    handleTimeChange(label, percent) {
      this.timerBar.setProps(label, percent);
    }

    handleManagerEvents(event, payload) {
      const { LOGIC_EVENTS } = app;
      const { tilesComponent, gameManager } = this;

      switch (event) {
        case LOGIC_EVENTS.INIT:
          tilesComponent.render(payload);
          tilesComponent.onTileClick(value => gameManager.setTile(value));
          break;
        case LOGIC_EVENTS.SHOW_PATTERN:
          tilesComponent.showPattern(payload);
          tilesComponent.toggleSelectableTiles(false);
          break;
        case LOGIC_EVENTS.START_ROUND:
          tilesComponent.clearTilesState();
          tilesComponent.toggleSelectableTiles(true);
          break;
        case LOGIC_EVENTS.HALT:
          tilesComponent.clearTilesState();
          tilesComponent.toggleSelectableTiles(false);
          break;
        case LOGIC_EVENTS.LOSE:
          alert('you lose');
          break;
      }
    }

    bindEvents() {
      this.gameManager.onTime(this.handleTimeChange.bind(this));
      this.gameManager.on(this.handleManagerEvents.bind(this));
      this.$startBtn.addEventListener('click', () => this.gameManager.start());
      this.$difficultySelector.addEventListener('change', 
        (event) => this.gameManager.setLevel(event.target.value)
      );
    }

    renderComponents() {
      const { TilesContainerComponent, TimerBar } = app;

      this.tilesComponent = new TilesContainerComponent('#game-canvas');
      
      this.timerBar = new TimerBar();
      this.timerBar.render('#timer-bar');
    }

    renderDifficultySelector(levels) {
      const options = levels.map(level =>
        `<option value="${level}">${level}</option>`
      );

      return `
        <select class="${DIFFICULTY_SELECTOR_CLASS}">
          ${options}
        </select>
      `;
    }

    render(rootSelector) {
      const template = `
        <div class="app-container">
          <header class="header">
            <h1>Simon Says</h1>
          </header>

          <div class="player-control-bar">
            <button id="start-btn">Start</button>
            ${this.renderDifficultySelector(this.gameManager.getDifficultyLevels())}
            <div id="timer-bar"></div>
          </div>
          <div id="game-canvas"></div>
        </div>
      `;

      this.$root = document.querySelector(rootSelector);
      this.$root.innerHTML = template;
      this.extractElements();
      this.bindEvents();
      this.renderComponents();
      this.gameManager.init();
    }
  }

  app.AppComponent = AppComponent;
})(window.app);