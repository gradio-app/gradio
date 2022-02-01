class Timer {
  constructor (func) {
    this.func = func;
    this.running = false;
    this.id = null;

    this._handler = () => {
      this.running = false;
      this.id = null;

      return this.func();
    };
  }

  start (timeout) {
    if (this.running) {
      clearTimeout(this.id);
    }

    this.id = setTimeout(this._handler, timeout);
    this.running = true;
  }

  stop () {
    if (this.running) {
      clearTimeout(this.id);
      this.running = false;
      this.id = null;
    }
  }
};

Timer.start = (timeout, func) => setTimeout(func, timeout);

exports.Timer = Timer;
