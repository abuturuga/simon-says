((app) => {

  /**
   * Manage the timing interval functionality with a single
   * set timeout into one place and also provides a cronometer.
   * 
   * @class
   */
  class TimeManager {

    constructor() {
      this.intervalId = null;
    }

    /**
     * Start a cronometer for a given period of time, call the callback
     * durring this time with the remaing percentage from the time.
     * 
     * @public
     * @param {Function} callback Called until the inverval is finished.
     * @param {number} duration Interval duration
     */
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

    /**
     * Force stop on the cronometer.
     * 
     * @public
     */
    stop() {
      clearInterval(this.intervalId);
    }
  }

  app.TimeManager = TimeManager;
})(window.app);