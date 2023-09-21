# @gradio/highlightedtext

## 0.4.0-beta.5

### Features

- [#5648](https://github.com/gradio-app/gradio/pull/5648) [`c573e2339`](https://github.com/gradio-app/gradio/commit/c573e2339b86c85b378dc349de5e9223a3c3b04a) - Publish all components to npm.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.4.0-beta.4

### Patch Changes

- Updated dependencies [[`0b4fd5b6d`](https://github.com/gradio-app/gradio/commit/0b4fd5b6db96fc95a155e5e935e17e1ab11d1161)]:
  - @gradio/utils@0.2.0-beta.3
  - @gradio/atoms@0.2.0-beta.3
  - @gradio/statustracker@0.3.0-beta.4

## 0.4.0-beta.3

### Patch Changes

- Updated dependencies [[`14fc612d8`](https://github.com/gradio-app/gradio/commit/14fc612d84bf6b1408eccd3a40fab41f25477571)]:
  - @gradio/utils@0.2.0-beta.2
  - @gradio/atoms@0.2.0-beta.2
  - @gradio/statustracker@0.3.0-beta.3

## 0.4.0-beta.2

### Features

- [#5620](https://github.com/gradio-app/gradio/pull/5620) [`c4c25ecdf`](https://github.com/gradio-app/gradio/commit/c4c25ecdf8c2fab5e3c41b519564e3b6a9ebfce3) - fix build and broken imports. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.0-beta.1

### Patch Changes

- Updated dependencies [[`142880ba5`](https://github.com/gradio-app/gradio/commit/142880ba589126d98da3d6a38866828864cc6b81)]:
  - @gradio/theme@0.2.0-beta.1
  - @gradio/utils@0.2.0-beta.1
  - @gradio/atoms@0.2.0-beta.1
  - @gradio/statustracker@0.3.0-beta.1

## 0.4.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

### Fixes

- [#5602](https://github.com/gradio-app/gradio/pull/5602) [`54d21d3f1`](https://github.com/gradio-app/gradio/commit/54d21d3f18f2ddd4e796d149a0b41461f49c711b) - Ensure `HighlightedText` with `merge_elements` loads without a value. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.3.0

### Features

- [#5400](https://github.com/gradio-app/gradio/pull/5400) [`d112e261`](https://github.com/gradio-app/gradio/commit/d112e2611b0fc79ecedfaed367571f3157211387) - Allow interactive input in `gr.HighlightedText`. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.2.3

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/statustracker@0.2.0
  - @gradio/theme@0.1.0
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2

## 0.2.2

### Patch Changes

- Updated dependencies [[`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db)]:
  - @gradio/icons@0.1.0
  - @gradio/utils@0.1.0
  - @gradio/atoms@0.1.1
  - @gradio/statustracker@0.1.1

## 0.2.1

### Features

- [#5284](https://github.com/gradio-app/gradio/pull/5284) [`5f25eb68`](https://github.com/gradio-app/gradio/commit/5f25eb6836f6a78ce6208b53495a01e1fc1a1d2f) - Minor bug fix sweep. Thanks [@aliabid94](https://github.com/aliabid94)!/n - Our use of **exit** was catching errors and corrupting the traceback of any component that failed to instantiate (try running blocks_kitchen_sink off main for an example). Now the **exit** exits immediately if there's been an exception, so the original exception can be printed cleanly/n - HighlightedText was rendering weird, cleaned it up

## 0.2.0

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

## 0.1.0

### Features

- [#5046](https://github.com/gradio-app/gradio/pull/5046) [`5244c587`](https://github.com/gradio-app/gradio/commit/5244c5873c355cf3e2f0acb7d67fda3177ef8b0b) - Allow new lines in `HighlightedText` with `/n` and preserve whitespace. Thanks [@hannahblair](https://github.com/hannahblair)!