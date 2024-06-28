# @gradio/simpleimage

## 0.6.1

### Dependency updates

- @gradio/upload@0.11.4
- @gradio/client@1.2.1

## 0.6.0

### Features

- [#8131](https://github.com/gradio-app/gradio/pull/8131) [`bb504b4`](https://github.com/gradio-app/gradio/commit/bb504b494947a287d6386e0e7ead3860c0f15223) - Gradio components in `gr.Chatbot()`.  Thanks @dawoodkhan82!

### Dependency updates

- @gradio/atoms@0.7.5
- @gradio/utils@0.5.0
- @gradio/icons@0.5.0
- @gradio/wasm@0.11.0
- @gradio/client@1.2.0
- @gradio/statustracker@0.7.0
- @gradio/upload@0.11.3

## 0.5.10

### Dependency updates

- @gradio/client@1.1.1
- @gradio/upload@0.11.2

## 0.5.9

### Dependency updates

- @gradio/upload@0.11.1
- @gradio/client@1.1.0

## 0.5.8

### Dependency updates

- @gradio/statustracker@0.6.0
- @gradio/client@1.0.0
- @gradio/upload@0.11.0

## 0.5.7

### Dependency updates

- @gradio/upload@0.10.7
- @gradio/client@0.20.1

## 0.5.6

### Dependency updates

- @gradio/client@0.20.0
- @gradio/statustracker@0.6.0
- @gradio/upload@0.10.6

## 0.5.5

### Dependency updates

- @gradio/utils@0.4.2
- @gradio/atoms@0.7.4
- @gradio/statustracker@0.5.5
- @gradio/upload@0.10.5
- @gradio/client@0.19.4

## 0.5.4

### Dependency updates

- @gradio/client@0.19.3
- @gradio/statustracker@0.5.4
- @gradio/upload@0.10.4

## 0.5.3

### Dependency updates

- @gradio/upload@0.10.3
- @gradio/client@0.19.2

## 0.5.2

### Dependency updates

- @gradio/statustracker@0.5.3
- @gradio/client@0.19.1
- @gradio/upload@0.10.2

## 0.5.1

### Fixes

- [#8252](https://github.com/gradio-app/gradio/pull/8252) [`22df61a`](https://github.com/gradio-app/gradio/commit/22df61a26adf8023f6dd49c051979990e8d3879a) - Client node fix.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.3
- @gradio/statustracker@0.5.2
- @gradio/client@0.19.0
- @gradio/icons@0.4.1
- @gradio/upload@0.10.1

## 0.5.0

### Features

- [#8209](https://github.com/gradio-app/gradio/pull/8209) [`b9afe93`](https://github.com/gradio-app/gradio/commit/b9afe93915401df5bd6737c89395c2477acfa585) - Rename `eventSource_Factory` and `fetch_implementation`.  Thanks @hannahblair!

### Fixes

- [#8179](https://github.com/gradio-app/gradio/pull/8179) [`6a218b4`](https://github.com/gradio-app/gradio/commit/6a218b4148095aaa0c58d8c20973ba01c8764fc2) - rework upload to be a class method + pass client into each component.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.2
- @gradio/client@0.18.0
- @gradio/upload@0.10.0
- @gradio/utils@0.4.1
- @gradio/wasm@0.10.1
- @gradio/statustracker@0.5.1

## 0.4.0

### Highlights

#### Setting File Upload Limits ([#7909](https://github.com/gradio-app/gradio/pull/7909) [`2afca65`](https://github.com/gradio-app/gradio/commit/2afca6541912b37dc84f447c7ad4af21607d7c72))

We have added a `max_file_size` size parameter to `launch()` that limits to size of files uploaded to the server. This limit applies to each individual file. This parameter can be specified as a string or an integer (corresponding to the size in bytes).

The following code snippet sets a max file size of 5 megabytes.

```python
import gradio as gr

demo = gr.Interface(lambda x: x, "image", "image")

demo.launch(max_file_size="5mb")
# or
demo.launch(max_file_size=5 * gr.FileSize.MB)
```

![max_file_size_upload](https://github.com/gradio-app/gradio/assets/41651716/7547330c-a082-4901-a291-3f150a197e45)


#### Error states can now be cleared

When a component encounters an error, the error state shown in the UI can now be cleared by clicking on the `x` icon in the top right of the component. This applies to all types of errors, whether it's raised in the UI or the server.

![error_modal_calculator](https://github.com/gradio-app/gradio/assets/41651716/16cb071c-accd-45a6-9c18-0dea27d4bd98)

 Thanks @freddyaboulton!

### Fixes

- [#8066](https://github.com/gradio-app/gradio/pull/8066) [`624f9b9`](https://github.com/gradio-app/gradio/commit/624f9b9477f74a581a6c14119234f9efdfcda398) - make gradio dev tools a local dependency rather than bundling.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.1
- @gradio/client@0.17.0
- @gradio/statustracker@0.5.0
- @gradio/upload@0.9.0
- @gradio/utils@0.4.0

## 0.3.12

### Dependency updates

- @gradio/utils@0.3.2
- @gradio/statustracker@0.4.12
- @gradio/client@0.16.0
- @gradio/upload@0.8.5
- @gradio/atoms@0.7.0
- @gradio/icons@0.4.0

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