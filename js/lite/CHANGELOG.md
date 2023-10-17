# @gradio/lite

## 0.3.2

### Features

- [#5868](https://github.com/gradio-app/gradio/pull/5868) [`4e0d87e9c`](https://github.com/gradio-app/gradio/commit/4e0d87e9c471fe90a344a3036d0faed9188ef6f3) - fix @gradio/lite dependencies.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.1

### Features

- [#5226](https://github.com/gradio-app/gradio/pull/5226) [`64039707`](https://github.com/gradio-app/gradio/commit/640397075d17307dd4f0713d063ef3d009a87aa0) - add gradio as a devdep of @gradio/lite.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.0

### Minor Changes

- [#4785](https://github.com/gradio-app/gradio/pull/4785) [`da0e9447`](https://github.com/gradio-app/gradio/commit/da0e94479a235de35844a636efb5833cb1fe9aeb) Thanks [@whitphx](https://github.com/whitphx)! - Add methods to execute mounted Python files

### Patch Changes

- [#4788](https://github.com/gradio-app/gradio/pull/4788) [`8d0d4e0a`](https://github.com/gradio-app/gradio/commit/8d0d4e0a8ebe2425aef24a6f21b88598684b0965) Thanks [@whitphx](https://github.com/whitphx)! - Generate a prebuilt themed CSS file at build time

- [#4826](https://github.com/gradio-app/gradio/pull/4826) [`f0150c62`](https://github.com/gradio-app/gradio/commit/f0150c6260d657b150b73f0eecabd10b19d297c8) Thanks [@whitphx](https://github.com/whitphx)! - Unload the local modules before re-executing a Python script so the edits on the modules are reflected

- [#4779](https://github.com/gradio-app/gradio/pull/4779) [`80b49965`](https://github.com/gradio-app/gradio/commit/80b4996595d70167313d9abf29fb4f35abe66a0f) Thanks [@whitphx](https://github.com/whitphx)! - Add file system APIs and an imperative package install method

- [#4784](https://github.com/gradio-app/gradio/pull/4784) [`f757febe`](https://github.com/gradio-app/gradio/commit/f757febe181f0555aa01d4d349f92081819e2691) Thanks [@whitphx](https://github.com/whitphx)! - Remove the development code embedded in a dev HTML file so it will not be in a final bundle

- [#4785](https://github.com/gradio-app/gradio/pull/4785) [`da0e9447`](https://github.com/gradio-app/gradio/commit/da0e94479a235de35844a636efb5833cb1fe9aeb) Thanks [@whitphx](https://github.com/whitphx)! - Add controller.unmount()

- [#4846](https://github.com/gradio-app/gradio/pull/4846) [`76acf3cb`](https://github.com/gradio-app/gradio/commit/76acf3cb0b258c0e6bb38d611d766e5e54b68437) Thanks [@whitphx](https://github.com/whitphx)! - Fix the package name spec of markdown-it on the Wasm worker

## 0.2.0

### Minor Changes

- [#4732](https://github.com/gradio-app/gradio/pull/4732) [`1dc3c1a9`](https://github.com/gradio-app/gradio/commit/1dc3c1a9a2063daffc00d9231c1498d983ebc3bf) Thanks [@whitphx](https://github.com/whitphx)! - Add an imperative API to reurn the Python code and refresh the frontend

## 0.1.1

### Patch Changes

- [#4731](https://github.com/gradio-app/gradio/pull/4731) [`f9171288`](https://github.com/gradio-app/gradio/commit/f9171288d4cf0174952628276385fb553556c38a) Thanks [@whitphx](https://github.com/whitphx)! - Load the worker file from a different origin, e.g. CDN