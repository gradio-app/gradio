# @gradio/tabs

<<<<<<< HEAD
## 0.0.6-beta.5

### Features

- [#5590](https://github.com/gradio-app/gradio/pull/5590) [`d1ad1f671`](https://github.com/gradio-app/gradio/commit/d1ad1f671caef9f226eb3965f39164c256d8615c) - Attach `elem_classes` selectors to layout elements, and an id to the Tab button (for targeting via CSS/JS).  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.0.6-beta.4

### Features

- [#5648](https://github.com/gradio-app/gradio/pull/5648) [`c573e2339`](https://github.com/gradio-app/gradio/commit/c573e2339b86c85b378dc349de5e9223a3c3b04a) - Publish all components to npm.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.0.6-beta.3

### Patch Changes

- Updated dependencies [[`0b4fd5b6d`](https://github.com/gradio-app/gradio/commit/0b4fd5b6db96fc95a155e5e935e17e1ab11d1161)]:
  - @gradio/utils@0.2.0-beta.3

## 0.0.6-beta.2

### Patch Changes

- Updated dependencies [[`14fc612d8`](https://github.com/gradio-app/gradio/commit/14fc612d84bf6b1408eccd3a40fab41f25477571)]:
  - @gradio/utils@0.2.0-beta.2

## 0.0.6-beta.1
=======
## 0.0.7
>>>>>>> main

### Patch Changes

- Updated dependencies []:
<<<<<<< HEAD
  - @gradio/utils@0.2.0-beta.1

## 0.0.6-beta.0

### Patch Changes

- Updated dependencies [[`681f10c31`](https://github.com/gradio-app/gradio/commit/681f10c315a75cc8cd0473c9a0167961af7696db), [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9)]:
  - @gradio/utils@0.2.0-beta.0
=======
  - @gradio/utils@0.1.2

## 0.0.6

### Features

- [#5590](https://github.com/gradio-app/gradio/pull/5590) [`d1ad1f671`](https://github.com/gradio-app/gradio/commit/d1ad1f671caef9f226eb3965f39164c256d8615c) - Attach `elem_classes` selectors to layout elements, and an id to the Tab button (for targeting via CSS/JS). Thanks [@abidlabs](https://github.com/abidlabs)!
>>>>>>> main

## 0.0.5

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.1.1

## 0.0.4

### Patch Changes

- Updated dependencies [[`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db)]:
  - @gradio/utils@0.1.0

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

- Updated dependencies []:
  - @gradio/utils@0.0.2