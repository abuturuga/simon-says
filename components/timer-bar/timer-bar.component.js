((app) => {

  class TimerBar {

    constructor() {
      this.$root = null;
      this.$statusBar = null;
      this.hasRendered = false;
    }

    setProps(label, percent) {
      if (!this.hasRendered) return;

      this.$status.innerHTML = label;
      this.$loaderBar.style.width = `${percent}%`;
    }

    extractElements() {
      this.$status = this.$root.querySelector('.status');
      this.$loaderBar = this.$root.querySelector('.loader-bar');
    }

    renderLoadBar() {
      return `
        <div class="loader">
          <div class="loader-bar"></div>
        </div>
      `;
    }

    render(rootSelector) {
      const template = `
        <div class="time-bar-component">
          <span class="status"></span>
          ${this.renderLoadBar()}
        </div>
      `;

      this.$root = document.querySelector(rootSelector)
      this.$root.innerHTML = template;
      this.extractElements();
      this.hasRendered = true;
    }
  }

  app.TimerBar = TimerBar;
})(window.app);