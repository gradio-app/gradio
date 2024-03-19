# @gradio/wasm

## 0.9.0

### Features

- [#7660](https://github.com/gradio-app/gradio/pull/7660) [`f739bef`](https://github.com/gradio-app/gradio/commit/f739bef6c70a2b012dd896456709eae5ee4de7d5) - Add Playground to Lite Custom Element.  Thanks @aliabd!

## 0.8.0

### Features

- [#7571](https://github.com/gradio-app/gradio/pull/7571) [`2edba13`](https://github.com/gradio-app/gradio/commit/2edba133e2a3b58b953ac0894d486faf2819beeb) - Fix `CrossOriginWorkerMaker` to cache the blob URL.  Thanks @whitphx!

## 0.7.0

### Features

- [#7119](https://github.com/gradio-app/gradio/pull/7119) [`9c6de6d`](https://github.com/gradio-app/gradio/commit/9c6de6d85092c1c9378d7f81e5ec734221536812) - Upgrade Pyodide to 0.25.0.  Thanks [@whitphx](https://github.com/whitphx)!
- [#7340](https://github.com/gradio-app/gradio/pull/7340) [`4b0d589`](https://github.com/gradio-app/gradio/commit/4b0d58933057432758a54169a360eb352903d6b4) - chore(deps): update all non-major dependencies.  Thanks [@renovate](https://github.com/apps/renovate)!
- [#7345](https://github.com/gradio-app/gradio/pull/7345) [`561579d`](https://github.com/gradio-app/gradio/commit/561579d9b7b860c5cb3f8131e0dced0c8114463f) - fix-tests.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.6.0

### Features

- [#7061](https://github.com/gradio-app/gradio/pull/7061) [`05d8a3c`](https://github.com/gradio-app/gradio/commit/05d8a3c8030b733bd47250f5db6f89f230f9a707) - Update ruff to 0.1.13, enable more rules, fix issues.  Thanks [@akx](https://github.com/akx)!

## 0.5.1

### Fixes

- [#7150](https://github.com/gradio-app/gradio/pull/7150) [`be56c76`](https://github.com/gradio-app/gradio/commit/be56c76c7b5d2814ea8239c7dbeddc4b1d3701c4) - Lite: Add the `home_dir` to `sys.path`.  Thanks [@whitphx](https://github.com/whitphx)!
- [#7133](https://github.com/gradio-app/gradio/pull/7133) [`8c355a4`](https://github.com/gradio-app/gradio/commit/8c355a47844296e3aab250fe61e2ecc706122e78) - Add ruff mock for Lite.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.5.0

### Features

- [#6965](https://github.com/gradio-app/gradio/pull/6965) [`5d00dd3`](https://github.com/gradio-app/gradio/commit/5d00dd37ca14bbfef2ceac550b29dbe05ba8cab0) - Make <UploadProgress /> Wasm-compatible.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.4.1

### Features

- [#6887](https://github.com/gradio-app/gradio/pull/6887) [`8333db8`](https://github.com/gradio-app/gradio/commit/8333db83ac6e2c8511c104534c48137576d0bcd7) - Fix the Wasm worker to initialize the app directories.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#6938](https://github.com/gradio-app/gradio/pull/6938) [`459c5dc`](https://github.com/gradio-app/gradio/commit/459c5dc989849b1f0134467d260710fe891045d6) - replacing distutils.StrictVersion dependency for Python 3.12.  Thanks [@velaia](https://github.com/velaia)!

## 0.4.0

### Features

- [#6398](https://github.com/gradio-app/gradio/pull/6398) [`67ddd40`](https://github.com/gradio-app/gradio/commit/67ddd40b4b70d3a37cb1637c33620f8d197dbee0) - Lite v4.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6432](https://github.com/gradio-app/gradio/pull/6432) [`bdf81fe`](https://github.com/gradio-app/gradio/commit/bdf81fead86e1d5a29e6b036f1fff677f6480e6b) - Lite: Set the home dir path per appId at each runtime.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6416](https://github.com/gradio-app/gradio/pull/6416) [`5177132`](https://github.com/gradio-app/gradio/commit/5177132d718c77f6d47869b4334afae6380394cb) - Lite: Fix the `isMessagePort()` type guard in js/wasm/src/worker-proxy.ts.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.3.0

### Features

- [#6099](https://github.com/gradio-app/gradio/pull/6099) [`d84209703`](https://github.com/gradio-app/gradio/commit/d84209703b7a0728cdb49221e543500ddb6a8d33) - Lite: SharedWorker mode.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.2.0

## 0.2.0-beta.2

### Features

- [#6036](https://github.com/gradio-app/gradio/pull/6036) [`f2cd6cb7f`](https://github.com/gradio-app/gradio/commit/f2cd6cb7f4c118495fc4f4802363c051958bc940) - lite: install typing-extensions to avoid capping fastapi versions. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6076](https://github.com/gradio-app/gradio/pull/6076) [`f3f98f923`](https://github.com/gradio-app/gradio/commit/f3f98f923c9db506284b8440e18a3ac7ddd8398b) - Lite error handler. Thanks [@whitphx](https://github.com/whitphx)!

## 0.2.0-beta.1

### Features

- [#5963](https://github.com/gradio-app/gradio/pull/5963) [`174b73619`](https://github.com/gradio-app/gradio/commit/174b736194756e23f51bbaf6f850bac5f1ca95b5) - release wasm. Thanks [@pngwn](https://github.com/pngwn)!
- [#5964](https://github.com/gradio-app/gradio/pull/5964) [`5fbda0bd2`](https://github.com/gradio-app/gradio/commit/5fbda0bd2b2bbb2282249b8875d54acf87cd7e84) - Wasm release. Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.0

### Features

- [#5956](https://github.com/gradio-app/gradio/pull/5956) [`f769876e0`](https://github.com/gradio-app/gradio/commit/f769876e0fa62336425c4e8ada5e09f38353ff01) - Apply formatter (and small refactoring) to the Lite-related frontend code. Thanks [@whitphx](https://github.com/whitphx)!
- [#5958](https://github.com/gradio-app/gradio/pull/5958) [`6780d660b`](https://github.com/gradio-app/gradio/commit/6780d660bb8f3b969a4bd40644a49f3274a779a9) - Make the HTTP requests for the Wasm worker wait for the initial `run_code()` or `run_file()` to finish. Thanks [@whitphx](https://github.com/whitphx)!

## 0.1.0

### Features

- [#5868](https://github.com/gradio-app/gradio/pull/5868) [`4e0d87e9c`](https://github.com/gradio-app/gradio/commit/4e0d87e9c471fe90a344a3036d0faed9188ef6f3) - fix @gradio/lite dependencies. Thanks [@pngwn](https://github.com/pngwn)!
- [#5838](https://github.com/gradio-app/gradio/pull/5838) [`ead265c1b`](https://github.com/gradio-app/gradio/commit/ead265c1b98883f7971eb454b14fc81442e0589f) - Lite: Convert an error object caught in the worker to be cloneable. Thanks [@whitphx](https://github.com/whitphx)!
- [#5627](https://github.com/gradio-app/gradio/pull/5627) [`b67115e8e`](https://github.com/gradio-app/gradio/commit/b67115e8e6e489fffd5271ea830211863241ddc5) - Lite: Make the Examples component display media files using pseudo HTTP requests to the Wasm server. Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#5919](https://github.com/gradio-app/gradio/pull/5919) [`1724918f0`](https://github.com/gradio-app/gradio/commit/1724918f06845e9fd12b6dd82710dd05a969a1cf) - Lite: Add a break statement. Thanks [@whitphx](https://github.com/whitphx)!

## 0.0.4

### Features

- [#5124](https://github.com/gradio-app/gradio/pull/5124) [`6e56a0d9b`](https://github.com/gradio-app/gradio/commit/6e56a0d9b0c863e76c69e1183d9d40196922b4cd) - Lite: Websocket queueing. Thanks [@whitphx](https://github.com/whitphx)!

## 0.0.3

### Features

- [#5598](https://github.com/gradio-app/gradio/pull/5598) [`6b1714386`](https://github.com/gradio-app/gradio/commit/6b17143868bdd2c1400af1199a01c1c0d5c27477) - Upgrade Pyodide to 0.24.0 and install the native orjson package. Thanks [@whitphx](https://github.com/whitphx)!

## 0.0.2

### Fixes

- [#5538](https://github.com/gradio-app/gradio/pull/5538) [`b5c6f7b08`](https://github.com/gradio-app/gradio/commit/b5c6f7b086a6419f27c757ad9b2ac9ea679b749b) - chore(deps): update dependency pyodide to ^0.24.0. Thanks [@renovate](https://github.com/apps/renovate)!