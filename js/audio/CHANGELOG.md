# @gradio/audio

## 0.3.7

### Fixes

- [#5794](https://github.com/gradio-app/gradio/pull/5794) [`f096c3ae1`](https://github.com/gradio-app/gradio/commit/f096c3ae168c0df00f90fe131c1e48c572e0574b) - Throw helpful error when media devices are not found.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.3.6

### Patch Changes

- Updated dependencies [[`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2)]:
  - @gradio/icons@0.2.0
  - @gradio/atoms@0.1.3
  - @gradio/statustracker@0.2.1
  - @gradio/upload@0.3.1
  - @gradio/button@0.2.1

## 0.3.5

### Patch Changes

- Updated dependencies [[`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423)]:
  - @gradio/button@0.2.0
  - @gradio/upload@0.3.0

## 0.3.4

### Fixes

- [#5587](https://github.com/gradio-app/gradio/pull/5587) [`e0d61b8ba`](https://github.com/gradio-app/gradio/commit/e0d61b8baa0f6293f53b9bdb1647d42f9ae2583a) - Fix `.clear()` events for audio and image. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.3.3

### Fixes

- [#5459](https://github.com/gradio-app/gradio/pull/5459) [`bd2fda77`](https://github.com/gradio-app/gradio/commit/bd2fda77fc98d815f4fb670f535af453ebee9b80) - Dispatch `stop_recording` event in Audio. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.3.2

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/statustracker@0.2.0
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2
  - @gradio/button@0.1.3
  - @gradio/upload@0.2.1

## 0.3.1

### Features

- [#5370](https://github.com/gradio-app/gradio/pull/5370) [`61803c65`](https://github.com/gradio-app/gradio/commit/61803c6545e73fce47e8740bd46721ab9bb0ba5c) - chore(deps): update dependency extendable-media-recorder to v9. Thanks [@renovate](https://github.com/apps/renovate)!

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
- [#5264](https://github.com/gradio-app/gradio/pull/5264) [`46a2b600`](https://github.com/gradio-app/gradio/commit/46a2b600a7ff030a9ea1560b882b3bf3ad266bbc) - ensure translations for audio work correctly. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.2.0

### Features

- [#5149](https://github.com/gradio-app/gradio/pull/5149) [`144df459`](https://github.com/gradio-app/gradio/commit/144df459a3b7895e524defcfc4c03fbb8b083aca) - Add `show_edit_button` param to `gr.Audio`. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5023](https://github.com/gradio-app/gradio/pull/5023) [`e6317d77`](https://github.com/gradio-app/gradio/commit/e6317d77f87d3dad638acca3dbc4a9228570e63c) - Update dependency extendable-media-recorder to v8. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5085](https://github.com/gradio-app/gradio/pull/5085) [`13e47835`](https://github.com/gradio-app/gradio/commit/13e478353532c4af18cfa50772f8b6fb3c6c9818) - chore(deps): update dependency extendable-media-recorder to v8. Thanks [@renovate](https://github.com/apps/renovate)!

## 0.1.0

### Features

- [#4993](https://github.com/gradio-app/gradio/pull/4993) [`dc07a9f9`](https://github.com/gradio-app/gradio/commit/dc07a9f947de44b419d8384987a02dcf94977851) - Bringing back the "Add download button for audio" PR by [@leuryr](https://github.com/leuryr). Thanks [@abidlabs](https://github.com/abidlabs)!