# @gradio/paramviewer

## 0.4.4

### Patch Changes

- Updated dependencies [[`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89)]:
  - @gradio/statustracker@0.4.8

## 0.4.3

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.5.3
  - @gradio/statustracker@0.4.7

## 0.4.2

### Patch Changes

- Updated dependencies [[`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7)]:
  - @gradio/utils@0.3.0
  - @gradio/atoms@0.5.2
  - @gradio/statustracker@0.4.6

## 0.4.1

### Patch Changes

- Updated dependencies [[`fdd1521`](https://github.com/gradio-app/gradio/commit/fdd15213c24b9cbc58bbc1b6beb4af7c18f48557)]:
  - @gradio/utils@0.2.2
  - @gradio/atoms@0.5.1
  - @gradio/statustracker@0.4.5

## 0.4.0

### Features

- [#7109](https://github.com/gradio-app/gradio/pull/7109) [`125a832`](https://github.com/gradio-app/gradio/commit/125a832ab7ee2b5affa574e8b32c88f430cc6663) - generate docs when running `gradio cc build`. Thanks [@pngwn](https://github.com/pngwn)!

### Fixes

- [#7130](https://github.com/gradio-app/gradio/pull/7130) [`e7ab406`](https://github.com/gradio-app/gradio/commit/e7ab4063eb2624820b9f1076960e9596791d9427) - Fix ParamViewer css. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.3.0

### Highlights

#### Custom component documentation generator ([#7030](https://github.com/gradio-app/gradio/pull/7030) [`3a944ed`](https://github.com/gradio-app/gradio/commit/3a944ed9f162a224d26959a9c556346a9d205311))

If your custom component has type hints and docstrings for both parameters and return values, you can now automatically generate a documentation page and README.md with no additional effort. Simply run the following command:

```sh
gradio cc docs
```

This will generate a Gradio app that you can upload to spaces providing rich documentation for potential users. The documentation page includes:

- Installation instructions.
- A live embedded demo and working code snippet, pulled from your demo app.
- An API reference for initialising the component, with types, default values and descriptions.
- An explanation of how the component affects the user's predict function inputs and outputs.
- Any additional interfaces or classes that are necessary to understand the API reference.
- Optional links to GitHub, PyPi, and Hugging Face Spaces.

A README will also be generated detailing the same information but in a format that is optimised for viewing on GitHub or PyPi!

Thanks [@pngwn](https://github.com/pngwn)!

### Features

- [#7069](https://github.com/gradio-app/gradio/pull/7069) [`07d520c`](https://github.com/gradio-app/gradio/commit/07d520c7a2590eb5544bd0b17f82ea31ecf43e00) - fix versions. Thanks [@pngwn](https://github.com/pngwn)!
