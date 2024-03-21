# @gradio/video

## 0.6.7

### Dependency updates

- @gradio/client@0.14.0
- @gradio/upload@0.8.0
- @gradio/wasm@0.9.0
- @gradio/image@0.9.7

## 0.6.6

### Dependency updates

- @gradio/upload@0.7.7
- @gradio/client@0.13.0
- @gradio/wasm@0.8.0
- @gradio/image@0.9.6

## 0.6.5

### Patch Changes

- Updated dependencies [[`8181695`](https://github.com/gradio-app/gradio/commit/8181695e70187e8bc2bf7518697098c8d1b9843d)]:
  - @gradio/upload@0.7.6
  - @gradio/image@0.9.5

## 0.6.4

### Features

- [#7528](https://github.com/gradio-app/gradio/pull/7528) [`eda33b3`](https://github.com/gradio-app/gradio/commit/eda33b3763897a542acf298e523fa493dc655aee) - Refactors `get_fetchable_url_or_file()` to remove it from the frontend. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.6.3

### Patch Changes

- Updated dependencies [[`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89)]:
  - @gradio/statustracker@0.4.8
  - @gradio/image@0.9.3

## 0.6.2

### Patch Changes

- Updated dependencies [[`f191786`](https://github.com/gradio-app/gradio/commit/f1917867916647d383b8d7ce15e0c17f2abbdec1)]:
  - @gradio/icons@0.3.3
  - @gradio/atoms@0.5.3
  - @gradio/image@0.9.2
  - @gradio/statustracker@0.4.7
  - @gradio/upload@0.7.4

## 0.6.1

### Patch Changes

- Updated dependencies [[`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7), [`32b317f`](https://github.com/gradio-app/gradio/commit/32b317f24e3d43f26684bb9f3964f31efd0ea556)]:
  - @gradio/utils@0.3.0
  - @gradio/client@0.12.1
  - @gradio/atoms@0.5.2
  - @gradio/image@0.9.1
  - @gradio/statustracker@0.4.6
  - @gradio/upload@0.7.3

## 0.6.0

### Features

- [#7183](https://github.com/gradio-app/gradio/pull/7183) [`49d9c48`](https://github.com/gradio-app/gradio/commit/49d9c48537aa706bf72628e3640389470138bdc6) - [WIP] Refactor file normalization to be in the backend and remove it from the frontend of each component. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.5.1

### Features

- [#7274](https://github.com/gradio-app/gradio/pull/7274) [`fdd1521`](https://github.com/gradio-app/gradio/commit/fdd15213c24b9cbc58bbc1b6beb4af7c18f48557) - chore: Change time format (thanks @jjshoots for the independent contribution). Thanks [@arian81](https://github.com/arian81)!

### Fixes

- [#7192](https://github.com/gradio-app/gradio/pull/7192) [`8dd6f4b`](https://github.com/gradio-app/gradio/commit/8dd6f4bc1901792f05cd59e86df7b1dbab692739) - Handle the case where examples is `null` for all components. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.5.0

### Features

- [#7104](https://github.com/gradio-app/gradio/pull/7104) [`bc2cdc1`](https://github.com/gradio-app/gradio/commit/bc2cdc1df95b38025486cf76df4a494b66d98585) - Allow download button for interactive Audio and Video components. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.4.0

### Fixes

- [#6933](https://github.com/gradio-app/gradio/pull/6933) [`9cefd2e`](https://github.com/gradio-app/gradio/commit/9cefd2e90a1d0cc4d3e4e953fc5b9b1a7afb68dd) - Refactor examples so they accept data in the same format as is returned by function, rename `.as_example()` to `.process_example()`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7038](https://github.com/gradio-app/gradio/pull/7038) [`6be3c2c`](https://github.com/gradio-app/gradio/commit/6be3c2c47a616c904c8497d1fbef7a851c54d488) - Fix Chatbot custom component template. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.3.1

### Fixes

- [#6885](https://github.com/gradio-app/gradio/pull/6885) [`640b7fe`](https://github.com/gradio-app/gradio/commit/640b7fe05276e11720b4341cadf088491395e53d) - Fix issue with Webcam Recording. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.3.0

### Features

- [#6133](https://github.com/gradio-app/gradio/pull/6133) [`f742d0e`](https://github.com/gradio-app/gradio/commit/f742d0e861c8e25c5d77d9102c9d50f94b0d3383) - Lite: Support AnnotatedImage on Wasm. Thanks [@whitphx](https://github.com/whitphx)!
- [#6897](https://github.com/gradio-app/gradio/pull/6897) [`fb9c6ca`](https://github.com/gradio-app/gradio/commit/fb9c6cacd7ca4598c000f1f97d7d39a8c4463519) - Lite: Chatbot. Thanks [@whitphx](https://github.com/whitphx)!

## 0.2.4

### Features

- [#6854](https://github.com/gradio-app/gradio/pull/6854) [`e528f98`](https://github.com/gradio-app/gradio/commit/e528f98b88f4322f61d315e1770fce0448ca5e26) - chore(deps): update dependency mrmime to v2. Thanks [@renovate](https://github.com/apps/renovate)!

## 0.2.3

### Fixes

- [#6766](https://github.com/gradio-app/gradio/pull/6766) [`73268ee`](https://github.com/gradio-app/gradio/commit/73268ee2e39f23ebdd1e927cb49b8d79c4b9a144) - Improve source selection UX. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.2.2

### Patch Changes

- Updated dependencies [[`245d58e`](https://github.com/gradio-app/gradio/commit/245d58eff788e8d44a59d37a2d9b26d0f08a62b4)]:
  - @gradio/client@0.9.2
  - @gradio/image@0.5.2
  - @gradio/upload@0.5.5

## 0.2.1

### Patch Changes

- Updated dependencies [[`5d51fbc`](https://github.com/gradio-app/gradio/commit/5d51fbce7826da840a2fd4940feb5d9ad6f1bc5a), [`34f9431`](https://github.com/gradio-app/gradio/commit/34f943101bf7dd6b8a8974a6131c1ed7c4a0dac0)]:
  - @gradio/upload@0.5.4
  - @gradio/client@0.9.1
  - @gradio/image@0.5.1

## 0.2.0

### Features

- [#6726](https://github.com/gradio-app/gradio/pull/6726) [`21cfb0a`](https://github.com/gradio-app/gradio/commit/21cfb0acc309bb1a392f4d8a8e42f6be864c5978) - Remove the styles from the Image/Video primitive components and Fix the container styles. Thanks [@whitphx](https://github.com/whitphx)!
- [#6398](https://github.com/gradio-app/gradio/pull/6398) [`67ddd40`](https://github.com/gradio-app/gradio/commit/67ddd40b4b70d3a37cb1637c33620f8d197dbee0) - Lite v4. Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#6698](https://github.com/gradio-app/gradio/pull/6698) [`798eca5`](https://github.com/gradio-app/gradio/commit/798eca524d44289c536c47eec7c4fdce9fe81905) - Fit video media within Video component. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.1.9

### Fixes

- [#6566](https://github.com/gradio-app/gradio/pull/6566) [`d548202`](https://github.com/gradio-app/gradio/commit/d548202d2b5bd8a99e3ebc5bf56820b0282ce0f5) - Improve video trimming and error handling. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.1.8

### Patch Changes

- Updated dependencies [[`71f1a1f99`](https://github.com/gradio-app/gradio/commit/71f1a1f9931489d465c2c1302a5c8d768a3cd23a)]:
  - @gradio/client@0.8.2
  - @gradio/image@0.4.1
  - @gradio/upload@0.5.1

## 0.1.7

### Patch Changes

- Updated dependencies [[`9caddc17b`](https://github.com/gradio-app/gradio/commit/9caddc17b1dea8da1af8ba724c6a5eab04ce0ed8)]:
  - @gradio/atoms@0.3.0
  - @gradio/icons@0.3.0
  - @gradio/image@0.4.0
  - @gradio/statustracker@0.4.0
  - @gradio/upload@0.5.0

## 0.1.6

### Patch Changes

- Updated dependencies [[`2f805a7dd`](https://github.com/gradio-app/gradio/commit/2f805a7dd3d2b64b098f659dadd5d01258290521), [`f816136a0`](https://github.com/gradio-app/gradio/commit/f816136a039fa6011be9c4fb14f573e4050a681a)]:
  - @gradio/image@0.3.6
  - @gradio/upload@0.4.2
  - @gradio/atoms@0.2.2
  - @gradio/icons@0.2.1
  - @gradio/statustracker@0.3.2

## 0.1.5

### Features

- [#6406](https://github.com/gradio-app/gradio/pull/6406) [`0401c77f3`](https://github.com/gradio-app/gradio/commit/0401c77f3d35763b79e040dbe876e69083defd36) - Move ffmpeg to `Video` deps. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.1.4

### Patch Changes

- Updated dependencies [[`6204ccac5`](https://github.com/gradio-app/gradio/commit/6204ccac5967763e0ebde550d04d12584243a120), [`4d3aad33a`](https://github.com/gradio-app/gradio/commit/4d3aad33a0b66639dbbb2928f305a79fb7789b2d), [`854b482f5`](https://github.com/gradio-app/gradio/commit/854b482f598e0dc47673846631643c079576da9c), [`f1409f95e`](https://github.com/gradio-app/gradio/commit/f1409f95ed39c5565bed6a601e41f94e30196a57)]:
  - @gradio/image@0.3.4
  - @gradio/upload@0.4.0
  - @gradio/client@0.8.0

## 0.1.3

### Fixes

- [#6279](https://github.com/gradio-app/gradio/pull/6279) [`3cdeabc68`](https://github.com/gradio-app/gradio/commit/3cdeabc6843000310e1a9e1d17190ecbf3bbc780) - Ensure source selection does not get hidden in overflow. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.1.2

### Fixes

- [#6234](https://github.com/gradio-app/gradio/pull/6234) [`aaa55ce85`](https://github.com/gradio-app/gradio/commit/aaa55ce85e12f95aba9299445e9c5e59824da18e) - Video/Audio fixes. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.1.1

### Patch Changes

- Updated dependencies [[`2ba14b284`](https://github.com/gradio-app/gradio/commit/2ba14b284f908aa13859f4337167a157075a68eb)]:
  - @gradio/client@0.7.1
  - @gradio/image@0.3.1
  - @gradio/upload@0.3.1

## 0.1.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - fix circular dependency with client + upload. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Clean root url. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Improve Video Component. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Image v4. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.9

### Features

- [#6143](https://github.com/gradio-app/gradio/pull/6143) [`e4f7b4b40`](https://github.com/gradio-app/gradio/commit/e4f7b4b409323b01aa01b39e15ce6139e29aa073) - fix circular dependency with client + upload. Thanks [@pngwn](https://github.com/pngwn)!
- [#6136](https://github.com/gradio-app/gradio/pull/6136) [`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a) - JS Component Documentation. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6094](https://github.com/gradio-app/gradio/pull/6094) [`c476bd5a5`](https://github.com/gradio-app/gradio/commit/c476bd5a5b70836163b9c69bf4bfe068b17fbe13) - Image v4. Thanks [@pngwn](https://github.com/pngwn)!
- [#6149](https://github.com/gradio-app/gradio/pull/6149) [`90318b1dd`](https://github.com/gradio-app/gradio/commit/90318b1dd118ae08a695a50e7c556226234ab6dc) - swap `mode` on the frontned to `interactive` to match the backend. Thanks [@pngwn](https://github.com/pngwn)!
- [#6118](https://github.com/gradio-app/gradio/pull/6118) [`88bccfdba`](https://github.com/gradio-app/gradio/commit/88bccfdba3df2df4b2747ea5d649ed528047cf50) - Improve Video Component. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6140](https://github.com/gradio-app/gradio/pull/6140) [`71bf2702c`](https://github.com/gradio-app/gradio/commit/71bf2702cd5b810c89e2e53452532650acdcfb87) - Fix video. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.0-beta.8

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6067](https://github.com/gradio-app/gradio/pull/6067) [`bf38e5f06`](https://github.com/gradio-app/gradio/commit/bf38e5f06a7039be913614901c308794fea83ae0) - remove dupe component. Thanks [@pngwn](https://github.com/pngwn)!
- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.7

### Patch Changes

- Updated dependencies [[`174b73619`](https://github.com/gradio-app/gradio/commit/174b736194756e23f51bbaf6f850bac5f1ca95b5), [`5fbda0bd2`](https://github.com/gradio-app/gradio/commit/5fbda0bd2b2bbb2282249b8875d54acf87cd7e84)]:
  - @gradio/wasm@0.2.0-beta.1
  - @gradio/image@0.3.0-beta.7

## 0.1.0-beta.6

### Features

- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files. Thanks [@pngwn](https://github.com/pngwn)!
- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.1.0

### Features

- [#5627](https://github.com/gradio-app/gradio/pull/5627) [`b67115e8e`](https://github.com/gradio-app/gradio/commit/b67115e8e6e489fffd5271ea830211863241ddc5) - Lite: Make the Examples component display media files using pseudo HTTP requests to the Wasm server. Thanks [@whitphx](https://github.com/whitphx)!
- [#5934](https://github.com/gradio-app/gradio/pull/5934) [`8d909624f`](https://github.com/gradio-app/gradio/commit/8d909624f61a49536e3c0f71cb2d9efe91216219) - Fix styling issues with Audio, Image and Video components. Thanks [@aliabd](https://github.com/aliabd)!

## 0.0.11

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.1.2
  - @gradio/atoms@0.1.4
  - @gradio/image@0.3.2
  - @gradio/statustracker@0.2.2
  - @gradio/upload@0.3.2

## 0.0.10

### Patch Changes

- Updated dependencies [[`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2)]:
  - @gradio/icons@0.2.0
  - @gradio/atoms@0.1.3
  - @gradio/image@0.3.1
  - @gradio/statustracker@0.2.1
  - @gradio/upload@0.3.1

## 0.0.9

### Patch Changes

- Updated dependencies [[`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423)]:
  - @gradio/image@0.3.0
  - @gradio/upload@0.3.0

## 0.0.8

### Patch Changes

- Updated dependencies [[`e0d61b8ba`](https://github.com/gradio-app/gradio/commit/e0d61b8baa0f6293f53b9bdb1647d42f9ae2583a)]:
  - @gradio/image@0.2.4

## 0.0.7

### Patch Changes

- Updated dependencies [[`dc86e4a7`](https://github.com/gradio-app/gradio/commit/dc86e4a7e1c40b910c74558e6f88fddf9b3292bc)]:
  - @gradio/image@0.2.3

## 0.0.6

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/statustracker@0.2.0
  - @gradio/image@0.2.2
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2
  - @gradio/upload@0.2.1

## 0.0.5

### Patch Changes

- Updated dependencies [[`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db), [`79d8f9d8`](https://github.com/gradio-app/gradio/commit/79d8f9d891901683c5a1b7486efb44eab2478c96)]:
  - @gradio/icons@0.1.0
  - @gradio/utils@0.1.0
  - @gradio/upload@0.2.0
  - @gradio/atoms@0.1.1
  - @gradio/image@0.2.1
  - @gradio/statustracker@0.1.1

## 0.0.4

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

## 0.0.3

### Fixes

- [#5140](https://github.com/gradio-app/gradio/pull/5140) [`cd1353fa`](https://github.com/gradio-app/gradio/commit/cd1353fa3eb1b015f5860ca5d5a8e8d1aa4a831c) - Fixes the display of minutes in the video player. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.0.2

### Patch Changes

- Updated dependencies [[`44ac8ad0`](https://github.com/gradio-app/gradio/commit/44ac8ad08d82ea12c503dde5c78f999eb0452de2)]:
  - @gradio/image@0.1.0
  - @gradio/utils@0.0.2
  - @gradio/atoms@0.0.2
  - @gradio/upload@0.0.2