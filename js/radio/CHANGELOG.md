# @gradio/radio

<<<<<<< HEAD
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
=======
## 0.3.2
>>>>>>> main

### Patch Changes

- Updated dependencies []:
<<<<<<< HEAD
  - @gradio/utils@0.2.0-beta.1
  - @gradio/atoms@0.2.0-beta.1
  - @gradio/statustracker@0.3.0-beta.1

## 0.3.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!
=======
  - @gradio/utils@0.1.2
  - @gradio/atoms@0.1.4
  - @gradio/statustracker@0.2.2

## 0.3.1

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.1.3
  - @gradio/statustracker@0.2.1

## 0.3.0

### Features

- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements. Thanks [@hannahblair](https://github.com/hannahblair)!
>>>>>>> main

## 0.2.0

### Features

- [#5384](https://github.com/gradio-app/gradio/pull/5384) [`ddc02268`](https://github.com/gradio-app/gradio/commit/ddc02268f731bd2ed04b7a5854accf3383f9a0da) - Allows the `gr.Dropdown` to have separate names and values, as well as enables `allow_custom_value` for multiselect dropdown. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.2

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/statustracker@0.2.0
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [[`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db)]:
  - @gradio/utils@0.1.0
  - @gradio/atoms@0.1.1
  - @gradio/statustracker@0.1.1

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

- [#5215](https://github.com/gradio-app/gradio/pull/5215) [`fbdad78a`](https://github.com/gradio-app/gradio/commit/fbdad78af4c47454cbb570f88cc14bf4479bbceb) - Lazy load interactive or static variants of a component individually, rather than loading both variants regardless. This change will improve performance for many applications. Thanks [@pngwn](https://github.com/pngwn)!
- [#5216](https://github.com/gradio-app/gradio/pull/5216) [`4b58ea6d`](https://github.com/gradio-app/gradio/commit/4b58ea6d98e7a43b3f30d8a4cb6f379bc2eca6a8) - Update i18n tokens and locale files. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5232](https://github.com/gradio-app/gradio/pull/5232) [`c57d4c23`](https://github.com/gradio-app/gradio/commit/c57d4c232a97e03b4671f9e9edc3af456438fe89) - `gr.Radio` and `gr.CheckboxGroup` can now accept different names and values. Thanks [@abidlabs](https://github.com/abidlabs)!
