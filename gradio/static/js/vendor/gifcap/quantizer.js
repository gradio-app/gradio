importScripts('encoder.js');

let initialized = false;
const frames = [];

function process(frame) {
  if (frame) {
    frames.push(frame);
  }

  while (initialized && (frame = frames.pop())) {
    const ptr = Module._malloc(frame.buffer.byteLength);
    const input = new Uint8Array(Module.HEAPU8.buffer, ptr, frame.buffer.byteLength);
    input.set(new Uint8Array(frame.buffer));

    const imageLength = frame.width * frame.height;
    const cb = addFunctionWasm((palettePtr, paletteLength, imagePtr) => {
      const buffer = new ArrayBuffer(paletteLength + imageLength);
      const result = new Uint8Array(buffer);
      result.set(new Uint8Array(Module.HEAPU8.buffer, palettePtr, paletteLength));
      result.set(new Uint8Array(Module.HEAPU8.buffer, imagePtr, imageLength), paletteLength);
      self.postMessage({ paletteLength, buffer }, { transfer: [buffer] });
    }, 'viii');

    Module['_quantize_image'](frame.width, frame.height, ptr, cb);
    Module._free(ptr);
  }
}

self.onmessage = msg => process(msg.data);

Module['onRuntimeInitialized'] = () => {
  initialized = true;
  process();
};