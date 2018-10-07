((app) => {

  const COMPONENT_CLASS = 'app-component',
        HEADER_CLASS = `${COMPONENT_CLASS}--header`,
        GAME_CANVAS_CLASS = `${COMPONENT_CLASS}--game-canvas`,
        CONTROL_BAR_CLASS = 'control-bar',
        START_BTN_CLASS = `${CONTROL_BAR_CLASS}--start-btn`,
        DIFFICULTY_SELECTOR_CLASS = `${CONTROL_BAR_CLASS}--difficulty-selector`,
        TIME_BAR_CLASS = `${CONTROL_BAR_CLASS}--time-bar`;

  class AppComponent {

    constructor() {
      this.$root = null;
      this.$startBtn = null;
      this.$gameCanvas = null;
      this.$timerBar = null;

      const { GameManager, TimeManager } = app;
      this.gameManager = new GameManager(new TimeManager());
    }

    _extractElements() {
      this.$startBtn = document.querySelector(`.${START_BTN_CLASS}`);
      this.$timerBar = document.querySelector(`.${TIME_BAR_CLASS}`);
      this.$gameCanvas = document.querySelector(`.${GAME_CANVAS_CLASS}`);
      this.$difficultySelector = document.querySelector(`.${DIFFICULTY_SELECTOR_CLASS}`);
    }

    _handleTimeChange(label, percent) {
      this.timerBar.setProps(label, percent);
    }

    _handleManagerEvents(event, payload) {
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

    _bindEvents() {
      this.gameManager.onTime(this._handleTimeChange.bind(this));
      this.gameManager.on(this._handleManagerEvents.bind(this));
      this.$startBtn.addEventListener('click', () => this.gameManager.start());
      this.$difficultySelector.addEventListener('change',
        (event) => this.gameManager.setLevel(event.target.value)
      );
    }

    _renderComponents() {
      const { TilesContainerComponent, TimerBar } = app;

      this.tilesComponent = new TilesContainerComponent(`.${GAME_CANVAS_CLASS}`);
      
      this.timerBar = new TimerBar();
      this.timerBar.render(`.${TIME_BAR_CLASS}`);
    }

    _renderDifficultySelector(levels) {
      const options = levels.map(level =>
        `<option value="${level}">${level}</option>`
      );

      return `
        <select class="${DIFFICULTY_SELECTOR_CLASS}">
          ${options}
        </select>
      `;
    }

    _renderControlBar() {
      return `
        <div class="${CONTROL_BAR_CLASS}">
          <button class="${START_BTN_CLASS}">Start</button>
          ${this._renderDifficultySelector(this.gameManager.getDifficultyLevels())}
          <div class="${TIME_BAR_CLASS}"></div>
        </div>
      `;
    }

    render(rootSelector) {
      const template = `
        <div class="${COMPONENT_CLASS}">
          <header class="${HEADER_CLASS}">
            <h1>Simon Says</h1>
          </header>
          ${this._renderControlBar()}
          <div class="${GAME_CANVAS_CLASS}"></div>
        </div>
      `;

      this.$root = document.querySelector(rootSelector);
      this.$root.innerHTML = template;
      this._extractElements();
      this._bindEvents();
      this._renderComponents();
      this.gameManager.init();
    }
  }

  app.AppComponent = AppComponent;
})(window.app);