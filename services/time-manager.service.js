((app) => {

  class TimeManager {

    constructor() {
      this.intervalId = null;
    }

    start(callback, duration) {
      clearInterval(this.intervalId);
      let counter = 0;
      let treshold = 10;

      this.intervalId = setInterval(() => {
        counter += treshold;
        callback(counter / duration * 100);

        if (counter >= duration) {
          clearInterval(this.intervalId)
          callback(null);
        }
      }, treshold);
    }

    stop() {
      clearInterval(this.intervalId);
    }
  }

  app.TimeManager = TimeManager;
})(window.app);