# @gradio/button

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @gradio/upload@0.3.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.1.2
  - @gradio/upload@0.3.2

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @gradio/upload@0.3.1

## 0.2.0

### Features

- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.1.3

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.1.1
  - @gradio/upload@0.2.1

## 0.1.2

### Patch Changes

- Updated dependencies [[`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db), [`79d8f9d8`](https://github.com/gradio-app/gradio/commit/79d8f9d891901683c5a1b7486efb44eab2478c96)]:
  - @gradio/utils@0.1.0
  - @gradio/upload@0.2.0

## 0.1.1

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

### Fixes

- [#5285](https://github.com/gradio-app/gradio/pull/5285) [`cdfd4217`](https://github.com/gradio-app/gradio/commit/cdfd42174a9c777eaee9c1209bf8e90d8c7791f2) - Tweaks to `icon` parameter in `gr.Button()`. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.0

### Features

- [#5080](https://github.com/gradio-app/gradio/pull/5080) [`37caa2e0`](https://github.com/gradio-app/gradio/commit/37caa2e0fe95d6cab8beb174580fb557904f137f) - Add icon and link params to `gr.Button`. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.0.2

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.0.2
