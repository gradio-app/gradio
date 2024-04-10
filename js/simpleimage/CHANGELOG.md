# @gradio/simpleimage

## 0.3.11

### Dependency updates

- @gradio/utils@0.3.1
- @gradio/atoms@0.6.2
- @gradio/statustracker@0.4.11
- @gradio/upload@0.8.4
- @gradio/client@0.15.1

## 0.3.10

### Dependency updates

- @gradio/upload@0.8.3
- @gradio/client@0.15.0

## 0.3.9

### Dependency updates

- @gradio/atoms@0.6.1
- @gradio/statustracker@0.4.10
- @gradio/icons@0.3.4
- @gradio/upload@0.8.2

## 0.3.8

### Dependency updates

- @gradio/upload@0.8.1
- @gradio/statustracker@0.4.9
- @gradio/wasm@0.10.0
- @gradio/atoms@0.6.0

## 0.3.7

### Dependency updates

- @gradio/client@0.14.0
- @gradio/upload@0.8.0
- @gradio/wasm@0.9.0

## 0.3.6

### Dependency updates

- @gradio/upload@0.7.7
- @gradio/client@0.13.0
- @gradio/wasm@0.8.0

## 0.3.5

### Patch Changes

- Updated dependencies [[`8181695`](https://github.com/gradio-app/gradio/commit/8181695e70187e8bc2bf7518697098c8d1b9843d)]:
  - @gradio/upload@0.7.6

## 0.3.4

### Features

- [#7528](https://github.com/gradio-app/gradio/pull/7528) [`eda33b3`](https://github.com/gradio-app/gradio/commit/eda33b3763897a542acf298e523fa493dc655aee) - Refactors `get_fetchable_url_or_file()` to remove it from the frontend. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.3.3

### Patch Changes

- Updated dependencies [[`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89)]:
  - @gradio/statustracker@0.4.8

## 0.3.2

### Patch Changes

- Updated dependencies [[`f191786`](https://github.com/gradio-app/gradio/commit/f1917867916647d383b8d7ce15e0c17f2abbdec1)]:
  - @gradio/icons@0.3.3
  - @gradio/atoms@0.5.3
  - @gradio/statustracker@0.4.7
  - @gradio/upload@0.7.4

## 0.3.1

### Patch Changes

- Updated dependencies [[`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7), [`32b317f`](https://github.com/gradio-app/gradio/commit/32b317f24e3d43f26684bb9f3964f31efd0ea556)]:
  - @gradio/utils@0.3.0
  - @gradio/client@0.12.1
  - @gradio/atoms@0.5.2
  - @gradio/statustracker@0.4.6
  - @gradio/upload@0.7.3

## 0.3.0

### Features

- [#7183](https://github.com/gradio-app/gradio/pull/7183) [`49d9c48`](https://github.com/gradio-app/gradio/commit/49d9c48537aa706bf72628e3640389470138bdc6) - [WIP] Refactor file normalization to be in the backend and remove it from the frontend of each component. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.2.0

### Features

- [#7129](https://github.com/gradio-app/gradio/pull/7129) [`ccdaec4`](https://github.com/gradio-app/gradio/commit/ccdaec45002d0a9d6016e8e2078b843a1ff9172b) - Add a `simpleimage` template for custom components. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7205](https://github.com/gradio-app/gradio/pull/7205) [`e418edd`](https://github.com/gradio-app/gradio/commit/e418edd011d06df519c778b9a50573288d5bf30f) - Fix SimpleImage package json. Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#7192](https://github.com/gradio-app/gradio/pull/7192) [`8dd6f4b`](https://github.com/gradio-app/gradio/commit/8dd6f4bc1901792f05cd59e86df7b1dbab692739) - Handle the case where examples is `null` for all components. Thanks [@abidlabs](https://github.com/abidlabs)!