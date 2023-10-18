# @gradio/wasm

## 0.3.0

### Features

- [#5983](https://github.com/gradio-app/gradio/pull/5983) [`a32aabaf5`](https://github.com/gradio-app/gradio/commit/a32aabaf50b14779dec889cf539d7a3770139bac) - Lite: Show initialization progress messages.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5987](https://github.com/gradio-app/gradio/pull/5987) [`d8a6491a1`](https://github.com/gradio-app/gradio/commit/d8a6491a18854cb8cad6221ba96dcbd20556e806) - Specify FastAPI version for the Wasm runtime as a workaround.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5982](https://github.com/gradio-app/gradio/pull/5982) [`ab1e5da55`](https://github.com/gradio-app/gradio/commit/ab1e5da5578d4a7cec1fe1117a8b660784a9ae30) - Lite: Fix error handling on the ASGI app.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#5980](https://github.com/gradio-app/gradio/pull/5980) [`686719a3b`](https://github.com/gradio-app/gradio/commit/686719a3b0bcd64479a5f3c485da4620d0747341) - Lite: Explicitly install a specific version of `anyio` to avoid version conflicts.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.2.0

### Features

- [#5956](https://github.com/gradio-app/gradio/pull/5956) [`f769876e0`](https://github.com/gradio-app/gradio/commit/f769876e0fa62336425c4e8ada5e09f38353ff01) - Apply formatter (and small refactoring) to the Lite-related frontend code.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5972](https://github.com/gradio-app/gradio/pull/5972) [`11a300791`](https://github.com/gradio-app/gradio/commit/11a3007916071f0791844b0a37f0fb4cec69cea3) - Lite: Support opening the entrypoint HTML page directly in browser via the `file:` protocol.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5958](https://github.com/gradio-app/gradio/pull/5958) [`6780d660b`](https://github.com/gradio-app/gradio/commit/6780d660bb8f3b969a4bd40644a49f3274a779a9) - Make the HTTP requests for the Wasm worker wait for the initial `run_code()` or `run_file()` to finish.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.1.0

### Features

- [#5868](https://github.com/gradio-app/gradio/pull/5868) [`4e0d87e9c`](https://github.com/gradio-app/gradio/commit/4e0d87e9c471fe90a344a3036d0faed9188ef6f3) - fix @gradio/lite dependencies.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5838](https://github.com/gradio-app/gradio/pull/5838) [`ead265c1b`](https://github.com/gradio-app/gradio/commit/ead265c1b98883f7971eb454b14fc81442e0589f) - Lite: Convert an error object caught in the worker to be cloneable.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5627](https://github.com/gradio-app/gradio/pull/5627) [`b67115e8e`](https://github.com/gradio-app/gradio/commit/b67115e8e6e489fffd5271ea830211863241ddc5) - Lite: Make the Examples component display media files using pseudo HTTP requests to the Wasm server.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#5919](https://github.com/gradio-app/gradio/pull/5919) [`1724918f0`](https://github.com/gradio-app/gradio/commit/1724918f06845e9fd12b6dd82710dd05a969a1cf) - Lite: Add a break statement.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.0.4

### Features

- [#5124](https://github.com/gradio-app/gradio/pull/5124) [`6e56a0d9b`](https://github.com/gradio-app/gradio/commit/6e56a0d9b0c863e76c69e1183d9d40196922b4cd) - Lite: Websocket queueing.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.0.3

### Features

- [#5598](https://github.com/gradio-app/gradio/pull/5598) [`6b1714386`](https://github.com/gradio-app/gradio/commit/6b17143868bdd2c1400af1199a01c1c0d5c27477) - Upgrade Pyodide to 0.24.0 and install the native orjson package.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.0.2

### Fixes

- [#5538](https://github.com/gradio-app/gradio/pull/5538) [`b5c6f7b08`](https://github.com/gradio-app/gradio/commit/b5c6f7b086a6419f27c757ad9b2ac9ea679b749b) - chore(deps): update dependency pyodide to ^0.24.0.  Thanks [@renovate](https://github.com/apps/renovate)!