# @gradio/html

## 0.0.6

### Patch Changes

- Updated dependencies []:
<<<<<<< HEAD
  - @gradio/utils@0.2.0-beta.1
  - @gradio/atoms@0.2.0-beta.1
  - @gradio/statustracker@0.3.0-beta.1

## 0.1.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!
=======
  - @gradio/utils@0.1.2
  - @gradio/atoms@0.1.4
  - @gradio/statustracker@0.2.2

## 0.0.5

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.1.3
  - @gradio/statustracker@0.2.1
>>>>>>> main

## 0.0.4

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/statustracker@0.2.0
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2

## 0.0.3

### Patch Changes

- Updated dependencies [[`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db)]:
  - @gradio/utils@0.1.0
  - @gradio/atoms@0.1.1
  - @gradio/statustracker@0.1.1

## 0.0.2

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