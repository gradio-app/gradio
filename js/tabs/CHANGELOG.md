# @gradio/tabs

## 0.4.5

### Fixes

- [#11344](https://github.com/gradio-app/gradio/pull/11344) [`b961441`](https://github.com/gradio-app/gradio/commit/b961441780d70c82504141bd4deae7b3290c2227) - Fixes default tab label.  Thanks @dawoodkhan82!

## 0.4.4

### Fixes

- [#11189](https://github.com/gradio-app/gradio/pull/11189) [`88f06c7`](https://github.com/gradio-app/gradio/commit/88f06c7b8126a67edefd3116c764148d0f39c6c7) - Ensure that tabs with `visible=False` don't show up in the overflow menu.  Thanks @abidlabs!

## 0.4.3

### Dependency updates

- @gradio/utils@0.10.2

## 0.4.2

### Dependency updates

- @gradio/utils@0.10.1

## 0.4.1

### Fixes

- [#10372](https://github.com/gradio-app/gradio/pull/10372) [`96bbde2`](https://github.com/gradio-app/gradio/commit/96bbde277e059f79bb2c9898576050e84dab147a) - Allow propogation of fill_height through Rows and Tabs, via scale.  Thanks @aliabid94!

## 0.4.0

### Features

- [#10192](https://github.com/gradio-app/gradio/pull/10192) [`4fc7fb7`](https://github.com/gradio-app/gradio/commit/4fc7fb777c42af537e4af612423fa44029657d41) - Ensure components can be remounted with their previous data.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.10.0

## 0.3.5

### Dependency updates

- @gradio/utils@0.9.0

## 0.3.4

### Dependency updates

- @gradio/utils@0.8.0

## 0.3.3

### Fixes

- [#9836](https://github.com/gradio-app/gradio/pull/9836) [`a4e70f3`](https://github.com/gradio-app/gradio/commit/a4e70f3c428d7a43e31b63d296e9c4c73b09eda8) - Fix Tabs in Rows.  Thanks @aliabid94!

## 0.3.2

### Fixes

- [#9653](https://github.com/gradio-app/gradio/pull/9653) [`61cd768`](https://github.com/gradio-app/gradio/commit/61cd768490a12f5d63101d5434092bcd1cfc43a8) - Ensures tabs with visible set to false are not visible.  Thanks @hannahblair!
- [#9738](https://github.com/gradio-app/gradio/pull/9738) [`2ade59b`](https://github.com/gradio-app/gradio/commit/2ade59b95d4c3610a1a461cc95f020fbf9627305) - Export `Tabs` type from `@gradio/tabs` and fix the Playground to be compatible with the new Tabs API.  Thanks @whitphx!

## 0.3.1

### Fixes

- [#9728](https://github.com/gradio-app/gradio/pull/9728) [`d0b2ce8`](https://github.com/gradio-app/gradio/commit/d0b2ce8c0f150f0b636ad7d2226f7c8c61401996) - Ensure tabs render in SSR mode and reduce time it takes for them to render.  Thanks @pngwn!

## 0.3.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Playground requirements tab
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Redesign `gr.Tabs()`
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - UI theme fixes
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Ssr part 2

### Dependencies

- @gradio/utils@0.7.0

## 0.3.0-beta.3

### Features

- [#9460](https://github.com/gradio-app/gradio/pull/9460) [`7352a89`](https://github.com/gradio-app/gradio/commit/7352a89722da91461c32fd33588531f3edce9c48) - Playground requirements tab.  Thanks @whitphx!
- [#9496](https://github.com/gradio-app/gradio/pull/9496) [`1647ebd`](https://github.com/gradio-app/gradio/commit/1647ebddc3e2ed6fc143a62629409e32afcc5801) - UI theme fixes.  Thanks @aliabid94!

## 0.3.0-beta.2

### Features

- [#9339](https://github.com/gradio-app/gradio/pull/9339) [`4c8c6f2`](https://github.com/gradio-app/gradio/commit/4c8c6f2fe603081941c5fdc43f48a0632b9f31ad) - Ssr part 2.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.7.0-beta.2

## 0.3.0-beta.1

### Features

- [#9199](https://github.com/gradio-app/gradio/pull/9199) [`3175c7a`](https://github.com/gradio-app/gradio/commit/3175c7aebc6ad2466d31d6949580f5a3cb4cd698) - Redesign `gr.Tabs()`.  Thanks @hannahblair!

### Dependency updates

- @gradio/utils@0.7.0-beta.1

## 0.2.14

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.1

## 0.2.13

### Features

- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.0

## 0.2.12

### Dependency updates

- @gradio/utils@0.5.2

## 0.2.11

### Dependency updates

- @gradio/utils@0.5.1

## 0.2.10

### Dependency updates

- @gradio/utils@0.5.0

## 0.2.9

### Dependency updates

- @gradio/utils@0.4.2

## 0.2.8

### Dependency updates

- @gradio/utils@0.4.1

## 0.2.7

### Fixes

- [#8066](https://github.com/gradio-app/gradio/pull/8066) [`624f9b9`](https://github.com/gradio-app/gradio/commit/624f9b9477f74a581a6c14119234f9efdfcda398) - make gradio dev tools a local dependency rather than bundling.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.4.0

## 0.2.6

### Dependency updates

- @gradio/utils@0.3.2

## 0.2.5

### Dependency updates

- @gradio/utils@0.3.1

## 0.2.4

### Fixes

- [#7470](https://github.com/gradio-app/gradio/pull/7470) [`ba3ec13`](https://github.com/gradio-app/gradio/commit/ba3ec1300e81e64be7389d759b89284c66473158) - Tab select fix.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.2.3

### Patch Changes

- Updated dependencies [[`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7)]:
  - @gradio/utils@0.3.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`fdd1521`](https://github.com/gradio-app/gradio/commit/fdd15213c24b9cbc58bbc1b6beb4af7c18f48557)]:
  - @gradio/utils@0.2.2

## 0.2.1

### Fixes

- [#7107](https://github.com/gradio-app/gradio/pull/7107) [`80f8fbf`](https://github.com/gradio-app/gradio/commit/80f8fbf0e8900627b9c2575bbd7c68fad8108544) - Add logic to handle non-interactive or hidden tabs. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.2.0

### Features

- [#7018](https://github.com/gradio-app/gradio/pull/7018) [`ec28b4e`](https://github.com/gradio-app/gradio/commit/ec28b4e7c47a9233d9e3a725cc9fe8f9044dfa94) - Add `visible` and `interactive` params to `gr.Tab()`. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.1.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.8

### Patch Changes

- Updated dependencies [[`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a)]:
  - @gradio/utils@0.2.0-beta.6

## 0.1.0-beta.7

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.6

### Features

- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files. Thanks [@pngwn](https://github.com/pngwn)!
- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.0.7

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.1.2

## 0.0.6

### Features

- [#5590](https://github.com/gradio-app/gradio/pull/5590) [`d1ad1f671`](https://github.com/gradio-app/gradio/commit/d1ad1f671caef9f226eb3965f39164c256d8615c) - Attach `elem_classes` selectors to layout elements, and an id to the Tab button (for targeting via CSS/JS). Thanks [@abidlabs](https://github.com/abidlabs)!

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