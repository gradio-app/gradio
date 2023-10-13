# @gradio/gallery

## 0.5.0

### Features

- [#5780](https://github.com/gradio-app/gradio/pull/5780) [`ed0f9a21b`](https://github.com/gradio-app/gradio/commit/ed0f9a21b04ad6b941b63d2ce45100dbd1abd5c5) - Adds `change()` event to `gr.Gallery`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5783](https://github.com/gradio-app/gradio/pull/5783) [`4567788bd`](https://github.com/gradio-app/gradio/commit/4567788bd1fc25df9322902ba748012e392b520a) - Adds the ability to set the `selected_index` in a `gr.Gallery`.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#5798](https://github.com/gradio-app/gradio/pull/5798) [`a0d3cc45c`](https://github.com/gradio-app/gradio/commit/a0d3cc45c6db48dc0db423c229b8fb285623cdc4) - Fix `gr.SelectData` so that the target attribute is correctly attached, and the filedata is included in the data attribute with `gr.Gallery`.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.4.1

### Fixes

- [#5735](https://github.com/gradio-app/gradio/pull/5735) [`abb5e9df4`](https://github.com/gradio-app/gradio/commit/abb5e9df47989b2c56c2c312d74944678f9f2d4e) - Ensure images with no caption download in gallery.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5754](https://github.com/gradio-app/gradio/pull/5754) [`502054848`](https://github.com/gradio-app/gradio/commit/502054848fdbe39fc03ec42445242b4e49b7affc) - Fix Gallery `columns` and `rows` params.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.4.0

### Features

- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.3.4

### Patch Changes

- Updated dependencies [[`e0d61b8ba`](https://github.com/gradio-app/gradio/commit/e0d61b8baa0f6293f53b9bdb1647d42f9ae2583a)]:
  - @gradio/image@0.2.4

## 0.3.3

### Fixes

- [#5528](https://github.com/gradio-app/gradio/pull/5528) [`dc86e4a7`](https://github.com/gradio-app/gradio/commit/dc86e4a7e1c40b910c74558e6f88fddf9b3292bc) - Lazy load all images. Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.3.2

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/statustracker@0.2.0
  - @gradio/image@0.2.2
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2
  - @gradio/upload@0.2.1

## 0.3.1

### Patch Changes

- Updated dependencies [[`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db), [`79d8f9d8`](https://github.com/gradio-app/gradio/commit/79d8f9d891901683c5a1b7486efb44eab2478c96)]:
  - @gradio/icons@0.1.0
  - @gradio/utils@0.1.0
  - @gradio/upload@0.2.0
  - @gradio/atoms@0.1.1
  - @gradio/image@0.2.1
  - @gradio/statustracker@0.1.1

## 0.3.0

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

### Features

- [#5215](https://github.com/gradio-app/gradio/pull/5215) [`fbdad78a`](https://github.com/gradio-app/gradio/commit/fbdad78af4c47454cbb570f88cc14bf4479bbceb) - Lazy load interactive or static variants of a component individually, rather than loading both variants regardless. This change will improve performance for many applications. Thanks [@pngwn](https://github.com/pngwn)!
- [#5216](https://github.com/gradio-app/gradio/pull/5216) [`4b58ea6d`](https://github.com/gradio-app/gradio/commit/4b58ea6d98e7a43b3f30d8a4cb6f379bc2eca6a8) - Update i18n tokens and locale files. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.2.0

### Features

- [#5025](https://github.com/gradio-app/gradio/pull/5025) [`6693660a`](https://github.com/gradio-app/gradio/commit/6693660a790996f8f481feaf22a8c49130d52d89) - Add download button to selected images in `Gallery`. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.1.0

### Features

- [#4995](https://github.com/gradio-app/gradio/pull/4995) [`3f8c210b`](https://github.com/gradio-app/gradio/commit/3f8c210b01ef1ceaaf8ee73be4bf246b5b745bbf) - Implement left and right click in `Gallery` component and show implicit images in `Gallery` grid. Thanks [@hannahblair](https://github.com/hannahblair)!