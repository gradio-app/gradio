# @gradio/file

<<<<<<< HEAD
## 0.2.0-beta.5

### Features

- [#5648](https://github.com/gradio-app/gradio/pull/5648) [`c573e2339`](https://github.com/gradio-app/gradio/commit/c573e2339b86c85b378dc349de5e9223a3c3b04a) - Publish all components to npm.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.2.0-beta.4

### Patch Changes

- Updated dependencies [[`0b4fd5b6d`](https://github.com/gradio-app/gradio/commit/0b4fd5b6db96fc95a155e5e935e17e1ab11d1161)]:
  - @gradio/utils@0.2.0-beta.3
  - @gradio/atoms@0.2.0-beta.3
  - @gradio/statustracker@0.3.0-beta.4
  - @gradio/upload@0.3.0-beta.3

## 0.2.0-beta.3

### Patch Changes

- Updated dependencies [[`14fc612d8`](https://github.com/gradio-app/gradio/commit/14fc612d84bf6b1408eccd3a40fab41f25477571)]:
  - @gradio/utils@0.2.0-beta.2
  - @gradio/atoms@0.2.0-beta.2
  - @gradio/statustracker@0.3.0-beta.3
  - @gradio/upload@0.3.0-beta.2

## 0.2.0-beta.2

### Features

- [#5620](https://github.com/gradio-app/gradio/pull/5620) [`c4c25ecdf`](https://github.com/gradio-app/gradio/commit/c4c25ecdf8c2fab5e3c41b519564e3b6a9ebfce3) - fix build and broken imports. Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.1

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.2.0-beta.1
  - @gradio/atoms@0.2.0-beta.1
  - @gradio/statustracker@0.3.0-beta.1
  - @gradio/upload@0.3.0-beta.1

## 0.2.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!
=======
## 0.2.1

### Patch Changes

- Updated dependencies [[`796145e2c`](https://github.com/gradio-app/gradio/commit/796145e2c48c4087bec17f8ec0be4ceee47170cb)]:
  - @gradio/client@0.5.1

## 0.2.0

### Highlights

#### new `FileExplorer` component ([#5672](https://github.com/gradio-app/gradio/pull/5672) [`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e))

Thanks to a new capability that allows components to communicate directly with the server _without_ passing data via the value, we have created a new `FileExplorer` component.

This component allows you to populate the explorer by passing a glob, but only provides the selected file(s) in your prediction function.

Users can then navigate the virtual filesystem and select files which will be accessible in your predict function. This component will allow developers to build more complex spaces, with more flexible input options.

![output](https://github.com/pngwn/MDsveX/assets/12937446/ef108f0b-0e84-4292-9984-9dc66b3e144d)

For more information check the [`FileExplorer` documentation](https://gradio.app/docs/fileexplorer).

Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.1.6

### Patch Changes

- Updated dependencies [[`6e56a0d9b`](https://github.com/gradio-app/gradio/commit/6e56a0d9b0c863e76c69e1183d9d40196922b4cd)]:
  - @gradio/client@0.4.2

## 0.1.5

### Patch Changes

- Updated dependencies [[`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2)]:
  - @gradio/icons@0.2.0
  - @gradio/atoms@0.1.3
  - @gradio/statustracker@0.2.1
  - @gradio/upload@0.3.1

## 0.1.4

### Patch Changes

- Updated dependencies [[`78e7cf516`](https://github.com/gradio-app/gradio/commit/78e7cf5163e8d205e8999428fce4c02dbdece25f)]:
  - @gradio/client@0.4.1

## 0.1.3

### Patch Changes

- Updated dependencies [[`c57f1b75e`](https://github.com/gradio-app/gradio/commit/c57f1b75e272c76b0af4d6bd0c7f44743ff34f26), [`40de3d217`](https://github.com/gradio-app/gradio/commit/40de3d2178b61ebe424b6f6228f94c0c6f679bea), [`ea0e00b20`](https://github.com/gradio-app/gradio/commit/ea0e00b207b4b90a10e9d054c4202d4e705a29ba), [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423)]:
  - @gradio/client@0.4.0
  - @gradio/upload@0.3.0
>>>>>>> main

## 0.1.2

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912), [`26fef8c7`](https://github.com/gradio-app/gradio/commit/26fef8c7f85a006c7e25cdbed1792df19c512d02)]:
  - @gradio/statustracker@0.2.0
  - @gradio/client@0.3.1
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2
  - @gradio/upload@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [[`119c8343`](https://github.com/gradio-app/gradio/commit/119c834331bfae60d4742c8f20e9cdecdd67e8c2), [`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db), [`79d8f9d8`](https://github.com/gradio-app/gradio/commit/79d8f9d891901683c5a1b7486efb44eab2478c96)]:
  - @gradio/client@0.3.0
  - @gradio/icons@0.1.0
  - @gradio/utils@0.1.0
  - @gradio/upload@0.2.0
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
- [#5221](https://github.com/gradio-app/gradio/pull/5221) [`f344592a`](https://github.com/gradio-app/gradio/commit/f344592aeb1658013235ded154107f72d86f24e7) - Allows setting a height to `gr.File` and improves the UI of the component. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5265](https://github.com/gradio-app/gradio/pull/5265) [`06982212`](https://github.com/gradio-app/gradio/commit/06982212dfbd613853133d5d0eebd75577967027) - Removes scrollbar from File preview when not needed. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5264](https://github.com/gradio-app/gradio/pull/5264) [`46a2b600`](https://github.com/gradio-app/gradio/commit/46a2b600a7ff030a9ea1560b882b3bf3ad266bbc) - ensure translations for audio work correctly. Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#5253](https://github.com/gradio-app/gradio/pull/5253) [`ddac7e4d`](https://github.com/gradio-app/gradio/commit/ddac7e4d0f55c3bdc6c3e9a9e24588b2563e4049) - Ensure File component uploads files to the server. Thanks [@pngwn](https://github.com/pngwn)!
- [#5313](https://github.com/gradio-app/gradio/pull/5313) [`54bcb724`](https://github.com/gradio-app/gradio/commit/54bcb72417b2781ad9d7500ea0f89aa9d80f7d8f) - Restores missing part of bottom border on file component. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.0.3

### Patch Changes

- Updated dependencies [[`61129052`](https://github.com/gradio-app/gradio/commit/61129052ed1391a75c825c891d57fa0ad6c09fc8), [`667875b2`](https://github.com/gradio-app/gradio/commit/667875b2441753e74d25bd9d3c8adedd8ede11cd), [`67265a58`](https://github.com/gradio-app/gradio/commit/67265a58027ef1f9e4c0eb849a532f72eaebde48), [`8b4eb8ca`](https://github.com/gradio-app/gradio/commit/8b4eb8cac9ea07bde31b44e2006ca2b7b5f4de36)]:
  - @gradio/client@0.2.0
  - @gradio/upload@0.0.3

## 0.0.2

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.0.2
  - @gradio/atoms@0.0.2
  - @gradio/upload@0.0.2