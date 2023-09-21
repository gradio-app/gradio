# @gradio/markdown

## 0.3.0-beta.5

### Features

- [#5648](https://github.com/gradio-app/gradio/pull/5648) [`c573e2339`](https://github.com/gradio-app/gradio/commit/c573e2339b86c85b378dc349de5e9223a3c3b04a) - Publish all components to npm.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.3.0-beta.4

### Patch Changes

- Updated dependencies [[`0b4fd5b6d`](https://github.com/gradio-app/gradio/commit/0b4fd5b6db96fc95a155e5e935e17e1ab11d1161)]:
  - @gradio/utils@0.2.0-beta.3
  - @gradio/atoms@0.2.0-beta.3
  - @gradio/statustracker@0.3.0-beta.4

## 0.3.0-beta.3

### Patch Changes

- Updated dependencies [[`14fc612d8`](https://github.com/gradio-app/gradio/commit/14fc612d84bf6b1408eccd3a40fab41f25477571)]:
  - @gradio/utils@0.2.0-beta.2
  - @gradio/atoms@0.2.0-beta.2
  - @gradio/statustracker@0.3.0-beta.3

## 0.3.0-beta.2

### Features

- [#5620](https://github.com/gradio-app/gradio/pull/5620) [`c4c25ecdf`](https://github.com/gradio-app/gradio/commit/c4c25ecdf8c2fab5e3c41b519564e3b6a9ebfce3) - fix build and broken imports. Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.0-beta.1

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.2.0-beta.1
  - @gradio/atoms@0.2.0-beta.1
  - @gradio/statustracker@0.3.0-beta.1

## 0.3.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0

### Features

- [#5342](https://github.com/gradio-app/gradio/pull/5342) [`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912) - significantly improve the performance of `gr.Dataframe` for large datasets. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.2

### Fixes

- [#5304](https://github.com/gradio-app/gradio/pull/5304) [`05892302`](https://github.com/gradio-app/gradio/commit/05892302fb8fe2557d57834970a2b65aea97355b) - Adds kwarg to disable html sanitization in `gr.Chatbot()`. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5393](https://github.com/gradio-app/gradio/pull/5393) [`e4e7a431`](https://github.com/gradio-app/gradio/commit/e4e7a4319924aaf51dcb18d07d0c9953d4011074) - Renders LaTeX that is added to the page in `gr.Markdown`, `gr.Chatbot`, and `gr.DataFrame`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5394](https://github.com/gradio-app/gradio/pull/5394) [`4d94ea0a`](https://github.com/gradio-app/gradio/commit/4d94ea0a0cf2103cda19f48398a5634f8341d04d) - Adds horizontal scrolling to content that overflows in gr.Markdown. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5368](https://github.com/gradio-app/gradio/pull/5368) [`b27f7583`](https://github.com/gradio-app/gradio/commit/b27f7583254165b135bf1496a7d8c489a62ba96f) - Change markdown rendering to set breaks to false. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.1

### Fixes

- [#5324](https://github.com/gradio-app/gradio/pull/5324) [`31996c99`](https://github.com/gradio-app/gradio/commit/31996c991d6bfca8cef975eb8e3c9f61a7aced19) - ensure login form has correct styles. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0

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

- [#5268](https://github.com/gradio-app/gradio/pull/5268) [`f49028cf`](https://github.com/gradio-app/gradio/commit/f49028cfe3e21097001ddbda71c560b3d8b42e1c) - Move markdown & latex processing to the frontend for the gr.Markdown and gr.DataFrame components. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5215](https://github.com/gradio-app/gradio/pull/5215) [`fbdad78a`](https://github.com/gradio-app/gradio/commit/fbdad78af4c47454cbb570f88cc14bf4479bbceb) - Lazy load interactive or static variants of a component individually, rather than loading both variants regardless. This change will improve performance for many applications. Thanks [@pngwn](https://github.com/pngwn)!