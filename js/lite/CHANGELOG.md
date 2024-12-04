# @gradio/lite

## 5.8.0

### Features

- [#10077](https://github.com/gradio-app/gradio/pull/10077) [`bf03d54`](https://github.com/gradio-app/gradio/commit/bf03d54e2fa413a4c98c4e3d6797b8b6a0a790ae) - Fix to call bootstrap_custom_element() if the script is loaded after the DOMContentLoaded event.  Thanks @whitphx!

## 5.7.0

### Dependency updates

- @gradio/atoms@0.11.2
- @gradio/core@0.4.1

## 5.6.0

### Dependency updates

- @gradio/atoms@0.11.1
- @gradio/core@0.4.0

## 5.5.0

### Features

- [#9424](https://github.com/gradio-app/gradio/pull/9424) [`a1582a6`](https://github.com/gradio-app/gradio/commit/a1582a6dca494618c734208cade87acfdac91004) - Lite worker refactoring.  Thanks @whitphx!
- [#9726](https://github.com/gradio-app/gradio/pull/9726) [`b6725cf`](https://github.com/gradio-app/gradio/commit/b6725cf6c1fe9667dc10e1988976ed36d84d73d3) - Lite auto-load imported modules with `pyodide.loadPackagesFromImports`.  Thanks @whitphx!

### Dependency updates

- @gradio/atoms@0.11.0
- @gradio/wasm@0.15.0
- @gradio/core@0.3.0

## 4.43.2

### Dependency updates

- @gradio/atoms@0.10.1
- @gradio/core@0.2.1

## 4.43.2

### Dependency updates

- @gradio/atoms@0.10.0
- @self/build@0.2.0
- @gradio/core@0.2.1

## 4.43.2

### Dependency updates

- @gradio/atoms@0.9.2

## 4.43.2

### Dependency updates

- @gradio/atoms@0.9.1
- @gradio/wasm@0.14.2
- @self/build@0.1.1
- @gradio/core@0.2.0

## 4.43.2

### Fixes

- [#9528](https://github.com/gradio-app/gradio/pull/9528) [`9004b11`](https://github.com/gradio-app/gradio/commit/9004b110640bdb54995343a870bf080ee15da02d) - Fix Lite to work on FireFox.  Thanks @whitphx!

### Dependency updates

- @gradio/wasm@0.14.1
- @gradio/core@0.1.1

## 4.43.1

### Features

- [#9617](https://github.com/gradio-app/gradio/pull/9617) [`c163182`](https://github.com/gradio-app/gradio/commit/c163182d1b752ef91629f9caa13bf3cce0fb0869) - Fix dark mode detection and container height.  Thanks @pngwn!

### Fixes

- [#9630](https://github.com/gradio-app/gradio/pull/9630) [`2eaa066`](https://github.com/gradio-app/gradio/commit/2eaa0667e1d1a0edd1089bf8c3ffa3f563b9bca2) - Fix duplicate attribute error.  Thanks @pngwn!

### Dependency updates

- @gradio/core@0.1.1

## 4.43.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Playground requirements tab
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Remove lite/theme.css from the Git-managed file tree
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - 🔡 Update default core Gradio font
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Stop using `multiprocessing` in `flagging.CSVLogger` on Lite v5
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Ssr part 2

## 4.43.0-beta.3

### Dependency updates

- @gradio/atoms@0.9.0-beta.5
- @gradio/core@0.1.0-beta.6
- @self/build@0.1.0-beta.3

## 4.43.0-beta.3

### Dependency updates

- @gradio/atoms@0.9.0-beta.4
- @gradio/core@0.1.0-beta.5

## 4.43.0-beta.3

### Features

- [#9460](https://github.com/gradio-app/gradio/pull/9460) [`7352a89`](https://github.com/gradio-app/gradio/commit/7352a89722da91461c32fd33588531f3edce9c48) - Playground requirements tab.  Thanks @whitphx!

### Dependency updates

- @gradio/core@0.1.0-beta.4
- @gradio/atoms@0.9.0-beta.3

## 4.43.0-beta.2

### Dependency updates

- @gradio/wasm@0.14.0-beta.3
- @gradio/core@0.1.0-beta.4

## 4.43.0-beta.2

### Dependency updates

- @gradio/core@0.1.0-beta.3

## 4.43.0-beta.2

### Dependency updates

- @gradio/core@0.1.0-beta.3

## 4.43.0-beta.2

### Features

- [#9339](https://github.com/gradio-app/gradio/pull/9339) [`4c8c6f2`](https://github.com/gradio-app/gradio/commit/4c8c6f2fe603081941c5fdc43f48a0632b9f31ad) - Ssr part 2.  Thanks @pngwn!
- [#9335](https://github.com/gradio-app/gradio/pull/9335) [`b543465`](https://github.com/gradio-app/gradio/commit/b543465d06d7d1b399c4d0755da05e022611a97f) - Remove lite/theme.css from the Git-managed file tree.  Thanks @whitphx!

### Dependency updates

- @gradio/atoms@0.9.0-beta.2
- @gradio/wasm@0.14.0-beta.2
- @gradio/core@0.1.0-beta.2
- @self/build@0.1.0-beta.2

## 4.43.0-beta.1

### Features

- [#9204](https://github.com/gradio-app/gradio/pull/9204) [`3c73f00`](https://github.com/gradio-app/gradio/commit/3c73f00e3016b16917ebfe0bad390f2dff683457) - 🔡 Update default core Gradio font.  Thanks @hannahblair!
- [#9246](https://github.com/gradio-app/gradio/pull/9246) [`38cf712`](https://github.com/gradio-app/gradio/commit/38cf71234bf57fe9da6eea2d32b1d6e7ef35c700) - Stop using `multiprocessing` in `flagging.CSVLogger` on Lite v5.  Thanks @whitphx!

### Dependency updates

- @gradio/atoms@0.8.1-beta.1
- @gradio/wasm@0.13.1-beta.1
- @gradio/theme@0.3.0-beta.1

## 4.43.0

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.8.1
- @gradio/wasm@0.13.1
- @gradio/theme@0.2.5

## 4.42.0

### Features

- [#9102](https://github.com/gradio-app/gradio/pull/9102) [`efdc323`](https://github.com/gradio-app/gradio/commit/efdc3231a7bde38cfe45d10086d0d36a24c1b9b4) - Initial SSR refactor.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.8.0
- @gradio/theme@0.2.4
- @gradio/wasm@0.13.0

## 4.41.0

### Dependency updates

- gradio@4.41.0

## 4.40.0

### Dependency updates

- gradio@4.40.0

## 4.39.0

### Dependency updates

- @gradio/wasm@0.12.0
- gradio@4.39.0

## 4.38.1

### Dependency updates

- gradio@4.38.1

## 4.38.0

### Dependency updates

- gradio@4.38.0

## 4.37.2

### Dependency updates

- gradio@4.37.2

## 4.37.1

### Dependency updates

- gradio@4.37.1

## 4.37.0

### Dependency updates

- @gradio/wasm@0.11.0
- gradio@4.37.0

## 4.36.1

### Dependency updates

- gradio@4.36.1

## 4.36.0

### Dependency updates

- gradio@4.36.0

## 4.35.0

### Dependency updates

- gradio@4.35.0

## 4.34.0

### Dependency updates

- gradio@4.34.0

## 4.33.0

### Dependency updates

- gradio@4.33.0

## 4.32.2

### Dependency updates

- gradio@4.32.2

## 4.32.1

### Dependency updates

- gradio@4.32.1

## 4.32.0

### Dependency updates

- gradio@4.32.0

## 4.31.5

### Dependency updates

- gradio@4.31.5

## 4.31.4

### Dependency updates

- gradio@4.31.4

## 4.31.3

### Dependency updates

- gradio@4.31.3

## 4.31.2

### Dependency updates

- gradio@4.31.2

## 4.31.1

### Dependency updates

- gradio@4.31.1

## 4.31.0

### Fixes

- [#8245](https://github.com/gradio-app/gradio/pull/8245) [`c562a3d`](https://github.com/gradio-app/gradio/commit/c562a3d9a440c8f94ca070bd07b8d4121d6ab7b3) - Cancel  server progress from the python client.  Thanks @freddyaboulton!

### Dependency updates

- gradio@4.31.0

## 4.29.0

### Features

- [#8052](https://github.com/gradio-app/gradio/pull/8052) [`1435d1d`](https://github.com/gradio-app/gradio/commit/1435d1d2dcfd1accf742726396f2213a54ae0837) - Extend Interface.from_pipeline() to support Transformers.js.py pipelines on Lite.  Thanks @whitphx!

### Dependency updates

- @gradio/wasm@0.10.1
- gradio@4.29.0

## 4.28.3

### Dependency updates

- gradio@4.28.3

## 4.28.2

### Dependency updates

- gradio@4.28.2

## 4.28.1

### Dependency updates

- gradio@4.28.1

## 4.28.0

### Dependency updates

- gradio@4.28.0

## 4.27.0

### Dependency updates

- gradio@4.27.0

## 4.26.0

### Features

- [#7811](https://github.com/gradio-app/gradio/pull/7811) [`b43055b`](https://github.com/gradio-app/gradio/commit/b43055b297dfe1aa56fda4cd722d878f7297a1b5) - Lite playground design changes.  Thanks @aliabd!

### Dependency updates

- gradio@4.26.0

## 4.25.0

### Dependency updates

- gradio@4.25.0

## 4.24.0

### Dependency updates

- gradio@4.24.0

## 4.23.0

### Dependency updates

- @gradio/wasm@0.10.0
- gradio@4.23.0

## 4.22.0

### Features

- [#7660](https://github.com/gradio-app/gradio/pull/7660) [`f739bef`](https://github.com/gradio-app/gradio/commit/f739bef6c70a2b012dd896456709eae5ee4de7d5) - Add Playground to Lite Custom Element.  Thanks @aliabd!

### Dependency updates

- @gradio/wasm@0.9.0
- gradio@4.22.0

## 4.21.0

### Features

- [#7647](https://github.com/gradio-app/gradio/pull/7647) [`57510f9`](https://github.com/gradio-app/gradio/commit/57510f9ce0b38d473cc90800a05e769f1a47be9b) - Lite version.  Thanks @pngwn!

### Dependency updates

- @gradio/wasm@0.8.0
- gradio@4.21.0

## 4.14.2

### Features

- [#7345](https://github.com/gradio-app/gradio/pull/7345) [`561579d`](https://github.com/gradio-app/gradio/commit/561579d9b7b860c5cb3f8131e0dced0c8114463f) - fix-tests.  Thanks [@pngwn](https://github.com/pngwn)!

## 4.14.1

### Features

- [#6999](https://github.com/gradio-app/gradio/pull/6999) [`576b7ce`](https://github.com/gradio-app/gradio/commit/576b7ce827f36b579384391e581e73760b7bfc53) - lite build fix: install build package.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7000](https://github.com/gradio-app/gradio/pull/7000) [`a7db8c1`](https://github.com/gradio-app/gradio/commit/a7db8c1b8a68c78f57088da1b1890e15dd0c5afe) - Add env to lite build.  Thanks [@aliabd](https://github.com/aliabd)!
- [#6997](https://github.com/gradio-app/gradio/pull/6997) [`523c08f`](https://github.com/gradio-app/gradio/commit/523c08fe3036f9d72416f7599fe0c64c1a4af823) - Design changes to Playground.  Thanks [@aliabd](https://github.com/aliabd)!

## 4.14.0

### Features

- [#6989](https://github.com/gradio-app/gradio/pull/6989) [`71aab1c`](https://github.com/gradio-app/gradio/commit/71aab1c6173665a7886399614dbb2dd864adbd6b) - Add README to @gradio/lite.  Thanks [@aliabd](https://github.com/aliabd)!
- [#6996](https://github.com/gradio-app/gradio/pull/6996) [`0b1f68d`](https://github.com/gradio-app/gradio/commit/0b1f68d2dbdaea3588fea6366a0da991a6e07f77) - bump lite to match gradio.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.4

## 0.4.4-beta.0

### Features

- [#6147](https://github.com/gradio-app/gradio/pull/6147) [`089161554`](https://github.com/gradio-app/gradio/commit/089161554ff216d01a447014b057368a1cc1bc35) - make lite private. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.3

### Fixes

- [#6032](https://github.com/gradio-app/gradio/pull/6032) [`62b89b8cc`](https://github.com/gradio-app/gradio/commit/62b89b8cc21b15fcb8807847ba2f37b66c2b9b61) - fix main entrypoint. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.2

### Fixes

- [#6015](https://github.com/gradio-app/gradio/pull/6015) [`7315fb2fe`](https://github.com/gradio-app/gradio/commit/7315fb2fe2074ffec4dd29325cb0f18cf2f263e8) - release. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.1

### Fixes

- [#5988](https://github.com/gradio-app/gradio/pull/5988) [`bea931c31`](https://github.com/gradio-app/gradio/commit/bea931c31b7c19ee88c82efa6261acc13e629d71) - release lite. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.0

### Features

- [#5975](https://github.com/gradio-app/gradio/pull/5975) [`ddd974956`](https://github.com/gradio-app/gradio/commit/ddd9749561dc7924ac7738c2ac1d21cf07518d00) - Just a small tweak to trigger a release of @gradio/lite. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.3.2

### Features

- [#5868](https://github.com/gradio-app/gradio/pull/5868) [`4e0d87e9c`](https://github.com/gradio-app/gradio/commit/4e0d87e9c471fe90a344a3036d0faed9188ef6f3) - fix @gradio/lite dependencies. Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.1

### Features

- [#5226](https://github.com/gradio-app/gradio/pull/5226) [`64039707`](https://github.com/gradio-app/gradio/commit/640397075d17307dd4f0713d063ef3d009a87aa0) - add gradio as a devdep of @gradio/lite. Thanks [@pngwn](https://github.com/pngwn)!

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