importScripts('encoder.js');

let initialized = false;
let opts;

const frames = [];
let encoder;

function process() {
  if (!encoder) {
    if (!initialized) {
      return;
    }

    encoder = Module['_encoder_new'](opts.width, opts.height);
  }

  let frame;
  while (frame = frames.shift()) {
    const imageLength = frame.width * frame.height;
    const ptr = Module._malloc(frame.paletteLength + imageLength);
    const input = new Uint8Array(Module.HEAPU8.buffer, ptr, frame.paletteLength + imageLength);
    input.set(new Uint8Array(frame.buffer));

    Module['_encoder_add_frame'](encoder, frame.top, frame.left, frame.width, frame.height, ptr, frame.delay / 10);
    Module._free(ptr);
  }
}

function finish() {
  if (!encoder) {
    return;
  }

  const cb = addFunctionWasm((ptr, length) => {
    const result = new Uint8Array(length);
    result.set(new Uint8Array(Module.HEAPU8.buffer, ptr, length));
    self.postMessage(result.buffer, { transfer: [result.buffer] });
  }, 'vii');

  Module['_encoder_finish'](encoder, cb);

  encoder = undefined;
}

self.onmessage = msg => {
  opts = msg.data;

  self.onmessage = msg => {
    if (msg.data === 'finish') {
      finish();
    } else {
      frames.push(msg.data);
      process();
    }
  };
};

Module['onRuntimeInitialized'] = () => {
  initialized = true;
  process();
};