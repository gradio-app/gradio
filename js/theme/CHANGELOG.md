# @gradio/theme

## 0.2.0-beta.1

### Features

- [#5615](https://github.com/gradio-app/gradio/pull/5615) [`142880ba5`](https://github.com/gradio-app/gradio/commit/142880ba589126d98da3d6a38866828864cc6b81) - Publish js theme.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.2.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5589](https://github.com/gradio-app/gradio/pull/5589) [`af1b2f9ba`](https://github.com/gradio-app/gradio/commit/af1b2f9bafbacf2804fcfe68af6bb4b921442aca) - image fixes.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0

### Features

- [#5342](https://github.com/gradio-app/gradio/pull/5342) [`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912) - significantly improve the performance of `gr.Dataframe` for large datasets.  Thanks [@pngwn](https://github.com/pngwn)!

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

### Fixes

- [#4997](https://github.com/gradio-app/gradio/pull/4997) [`41c83070`](https://github.com/gradio-app/gradio/commit/41c83070b01632084e7d29123048a96c1e261407) - Add CSS resets and specifiers to play nice with HF blog. Thanks [@aliabid94](https://github.com/aliabid94)!