# @gradio/dropdown

## 0.3.3

### Fixes

- [#5839](https://github.com/gradio-app/gradio/pull/5839) [`b83064da0`](https://github.com/gradio-app/gradio/commit/b83064da0005ca055fc15ee478cf064bf91702a4) - Fix error when scrolling dropdown with scrollbar.  Thanks [@Kit-p](https://github.com/Kit-p)!

## 0.3.2

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.1.2
  - @gradio/atoms@0.1.4
  - @gradio/statustracker@0.2.2

## 0.3.1

### Patch Changes

- Updated dependencies [[`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2)]:
  - @gradio/icons@0.2.0
  - @gradio/atoms@0.1.3
  - @gradio/statustracker@0.2.1

## 0.3.0

### Features

- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.2.2

### Fixes

- [#5544](https://github.com/gradio-app/gradio/pull/5544) [`a0cc9ac9`](https://github.com/gradio-app/gradio/commit/a0cc9ac931554e06dcb091158c9b9ac0cc580b6c) - Fixes dropdown breaking if a user types in invalid value and presses enter. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.2.1

### Fixes

- [#5525](https://github.com/gradio-app/gradio/pull/5525) [`21f1db40`](https://github.com/gradio-app/gradio/commit/21f1db40de6d1717eba97a550e11422a457ba7e9) - Ensure input value saves on dropdown blur. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.2.0

### Features

- [#5384](https://github.com/gradio-app/gradio/pull/5384) [`ddc02268`](https://github.com/gradio-app/gradio/commit/ddc02268f731bd2ed04b7a5854accf3383f9a0da) - Allows the `gr.Dropdown` to have separate names and values, as well as enables `allow_custom_value` for multiselect dropdown. Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#5508](https://github.com/gradio-app/gradio/pull/5508) [`05715f55`](https://github.com/gradio-app/gradio/commit/05715f5599ae3e928d3183c7b0a7f5291f843a96) - Adds a `filterable` parameter to `gr.Dropdown` that controls whether user can type to filter choices. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.3

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/statustracker@0.2.0
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2

## 0.1.2

### Fixes

- [#5360](https://github.com/gradio-app/gradio/pull/5360) [`64666525`](https://github.com/gradio-app/gradio/commit/6466652583e3c620df995fb865ef3511a34cb676) - Cancel Dropdown Filter. Thanks [@deckar01](https://github.com/deckar01)!

## 0.1.1

### Fixes

- [#5323](https://github.com/gradio-app/gradio/pull/5323) [`e32b0928`](https://github.com/gradio-app/gradio/commit/e32b0928d2d00342ca917ebb10c379ffc2ec200d) - ensure dropdown stays open when identical data is passed in. Thanks [@pngwn](https://github.com/pngwn)!

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

## 0.0.2

### Fixes

- [#5062](https://github.com/gradio-app/gradio/pull/5062) [`7d897165`](https://github.com/gradio-app/gradio/commit/7d89716519d0751072792c9bbda668ffeb597296) - `gr.Dropdown` now has correct behavior in static mode as well as when an option is selected. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5039](https://github.com/gradio-app/gradio/pull/5039) [`620e4645`](https://github.com/gradio-app/gradio/commit/620e46452729d6d4877b3fab84a65daf2f2b7bc6) - `gr.Dropdown()` now supports values with arbitrary characters and doesn't clear value when re-focused. Thanks [@abidlabs](https://github.com/abidlabs)!