((app) => {

  const LOADER_CLASS = 'loader',
        LOADER_BAR_CLASS = `${LOADER_CLASS}--bar`,
        COMPONENT_CLASS = 'time-bar-component',
        STATUS_CLASS = `${COMPONENT_CLASS}--status`;


  /**
   * This component will render and handle the time bar
   * @class
   */
  class TimerBar {

    constructor() {
      this.$root = null;
      this.$statusBar = null;
      this.hasRendered = false;
    }

    /**
     * Sets the the component props.
     * 
     * @public
     * @param {string} label State label
     * @param {number} percent Remaining time in percentage
     */
    setProps(label, percent) {
      if (!this.hasRendered) return;

      this.$status.innerHTML = label;
      this.$loaderBar.style.width = `${percent}%`;
    }

    /**
     * Cache the required HTMLElements in order to update them
     * when new props are provided.
     * 
     * @private
     */
    _extractElements() {
      this.$status = this.$root.querySelector(`.${STATUS_CLASS}`);
      this.$loaderBar = this.$root.querySelector(`.${LOADER_BAR_CLASS}`);
    }

    /**
     * Builds the template for the loader component.
     * 
     * @private
     * @returns {string}
     */
    _renderLoadBar() {
      return `
        <div class="${LOADER_CLASS}">
          <div class="${LOADER_BAR_CLASS}"></div>
        </div>
      `;
    }

    /**
     * Render the component into the page.
     *
     * @public
     * @param {string} rootSelector HTMLElement to attach the componnet
     */
    render(rootSelector) {
      const template = `
        <div class="${COMPONENT_CLASS}">
          <span class="${STATUS_CLASS}"></span>
          ${this._renderLoadBar()}
        </div>
      `;

      this.$root = document.querySelector(rootSelector)
      this.$root.innerHTML = template;
      this._extractElements();
      this.hasRendered = true;
    }
  }

  app.TimerBar = TimerBar;
})(window.app);