# @gradio/utils

<<<<<<< HEAD
## 0.2.0-beta.3

### Features

- [#5630](https://github.com/gradio-app/gradio/pull/5630) [`0b4fd5b6d`](https://github.com/gradio-app/gradio/commit/0b4fd5b6db96fc95a155e5e935e17e1ab11d1161) - Fix esbuild.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.2

### Features

- [#5624](https://github.com/gradio-app/gradio/pull/5624) [`14fc612d8`](https://github.com/gradio-app/gradio/commit/14fc612d84bf6b1408eccd3a40fab41f25477571) - Fix esbuild.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.1

### Patch Changes

- Updated dependencies [[`142880ba5`](https://github.com/gradio-app/gradio/commit/142880ba589126d98da3d6a38866828864cc6b81)]:
  - @gradio/theme@0.2.0-beta.1

## 0.2.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`681f10c31`](https://github.com/gradio-app/gradio/commit/681f10c315a75cc8cd0473c9a0167961af7696db) - release first version. Thanks [@pngwn](https://github.com/pngwn)!
=======
## 0.1.2

### Patch Changes

- Updated dependencies [[`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e)]:
  - @gradio/theme@0.2.0
>>>>>>> main

## 0.1.1

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/theme@0.1.0

## 0.1.0

### Highlights

#### Like/Dislike Button for Chatbot ([#5391](https://github.com/gradio-app/gradio/pull/5391) [`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db))

Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.0.3

### Highlights

#### Improve startup performance and markdown support ([#5279](https://github.com/gradio-app/gradio/pull/5279) [`fe057300`](https://github.com/gradio-app/gradio/commit/fe057300f0672c62dab9d9b4501054ac5d45a4ec))

##### Improved markdown support

We now have better support for markdown in `gr.Markdown` and `gr.Dataframe`. Including syntax highlighting and Github Flavoured Markdown. We also have more consistent markdown behaviour and styling.

##### Various performance improvements

These improvements will be particularly beneficial to large applications.

- Rather than attaching events manually, they are now delegated, leading to a significant performance improvement and addressing a performance regression introduced in a recent version of Gradio. App startup for large applications is now around twice as fast.
- Optimised the mounting of individual components, leading to a modest performance improvement during startup (~30%).
- Corrected an issue that was causing markdown to re-render infinitely.
- Ensured that the `gr.3DModel` does re-render prematurely.

Thanks [@pngwn](https://github.com/pngwn)!

## 0.0.2

### Patch Changes

- Updated dependencies [[`41c83070`](https://github.com/gradio-app/gradio/commit/41c83070b01632084e7d29123048a96c1e261407)]:
  - @gradio/theme@0.0.2