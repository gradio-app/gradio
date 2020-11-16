src = document.currentScript.src;
parent_dir = src.substring(0, src.lastIndexOf("/"));

function computeDiff(a, b, width) {
  const ua = new Uint32Array(a);
  const ub = new Uint32Array(b);

  let top = undefined;
  let bottom = undefined;
  let left = width + 1;
  let right = -1;

  for (let i = 0; i < ua.length; i++) {
    if ((ua[i] !== ub[i])) {
      const y = Math.floor(i / width);
      const x = i % width;

      if (top === undefined) top = y;
      bottom = y;
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
  }

  if (top !== undefined) {
    return { top, left, width: right - left + 1, height: bottom - top + 1 };
  }

  return undefined;
}

function cropBuffer(_from, box, width) {
  const result = new ArrayBuffer(4 * box.width * box.height);
  const arr = new Uint32Array(result);
  const from = new Uint32Array(_from);

  for (let y = 0; y < box.height; y++) {
    for (let x = 0; x < box.width; x++) {
      arr[x + y * box.width] = from[box.left + x + (box.top + y) * width];
    }
  }

  return result;
}

class GifEncoder {

  constructor(opts) {
    this.opts = opts;
    this.listeners = new Map();

    this.previousBuffer = undefined;
    this.frames = [];
    this.quantizers = [];
    this.framesSentToQuantize = 0;
    this.framesQuantized = 0;
    this.framesSentToEncode = 0;
    this.totalFrames = undefined;
    this.busyQuantizers = 0;

    this.writer = new Worker(parent_dir + '/writer.js');
    this.writer.postMessage(opts);

    const onMessage = msg => this._onWriterMessage(msg);
    this.writer.addEventListener('message', onMessage);
    this.disposeWriter = () => this.writer.removeEventListener('message', onMessage);

    const numberOfWorkers = navigator.hardwareConcurrency ? Math.floor(navigator.hardwareConcurrency * 0.8) : 4;
    for (let i = 0; i < numberOfWorkers; i++) {
      const worker = new Worker(parent_dir + '/quantizer.js');
      const onMessage = msg => this._onQuantizerMessage(i, msg);
      worker.addEventListener('message', onMessage);
      const dispose = () => worker.removeEventListener('message', onMessage);
      this.quantizers.push({ worker, busy: false, frameIndex: undefined, dispose });
    }
  }

  addFrame(imageData, delay) {
    if (!this.quantizers || this.totalFrames !== undefined) {
      return;
    }

    const buffer = imageData.data.buffer;

    if (!this.previousBuffer) {
      this.frames.push({ buffer, top: 0, left: 0, width: this.opts.width, height: this.opts.height, paletteLength: undefined, delay, quantized: false });
    } else {
      const box = computeDiff(buffer, this.previousBuffer, this.opts.width);

      if (!box) {
        this.frames[this.frames.length - 1].delay += delay; // no changes, let's drop the frame
      } else {
        const crop = cropBuffer(buffer, box, this.opts.width);
        this.frames.push({ buffer: crop, ...box, paletteLength: undefined, delay, quantized: false });
      }
    }

    this.previousBuffer = buffer;
    this._work();
  }

  _work() {
    if (!this.quantizers) {
      return;
    }

    while (this.framesSentToQuantize < (this.totalFrames === undefined ? this.frames.length - 1 : this.totalFrames) && this.busyQuantizers < this.quantizers.length) {
      const frameIndex = this.framesSentToQuantize++;
      const frame = this.frames[frameIndex];
      const worker = this.quantizers[this.quantizers.findIndex(x => !x.busy)];

      worker.busy = true;
      worker.frameIndex = frameIndex;
      worker.worker.postMessage(frame, { transfer: [frame.buffer] });
      this.busyQuantizers++;
    }
  }

  _onQuantizerMessage(workerIndex, msg) {
    if (!this.quantizers) {
      return;
    }

    const worker = this.quantizers[workerIndex];
    worker.busy = false;
    this.busyQuantizers--;
    this.framesQuantized++;

    const frame = this.frames[worker.frameIndex];
    frame.buffer = msg.data.buffer;
    frame.paletteLength = msg.data.paletteLength;
    frame.quantized = true;

    while ((this.totalFrames === undefined || this.framesSentToEncode < this.totalFrames) && this.frames[this.framesSentToEncode].quantized) {
      const frameIndex = this.framesSentToEncode++;
      const frame = this.frames[frameIndex];
      this.writer.postMessage(frame, { transfer: [frame.buffer] });
      this.frames[frameIndex] = undefined; // gc
    }

    if (this.framesSentToEncode === this.totalFrames) {
      this.writer.postMessage('finish', { transfer: [] });
    }

    if (this.totalFrames !== undefined) {
      this._emit('progress', this.framesQuantized / this.totalFrames);
    }

    this._work();
  }

  _onWriterMessage(msg) {
    const blob = new Blob([msg.data], { type: 'image/gif' });
    this._emit('finished', blob);
    this.dispose();
  }

  render() {
    if (!this.quantizers) {
      return;
    }

    this.totalFrames = this.frames.length;
    this._work();
  }

  abort() {
    this.dispose();
  }

  dispose() {
    if (!this.quantizers) {
      return;
    }

    this.writer.terminate();
    this.disposeWriter();

    for (const { worker, dispose } of this.quantizers) {
      worker.terminate();
      dispose();
    }

    this.quantizers = undefined;
    this.frames = undefined;
  }

  // event listener

  on(event, fn) {
    let listeners = this.listeners.get(event);

    if (!listeners) {
      listeners = [];
      this.listeners.set(event, listeners);
    }

    listeners.push(fn);
    return () => listeners.splice(listeners.indexOf(fn), 1);
  }

  once(event, fn) {
    const remove = this.on(event, data => {
      fn(data);
      remove();
    });
  }

  _emit(event, data) {
    const listeners = this.listeners.get(event) || [];

    for (const listener of listeners) {
      listener(data);
    }
  }
}