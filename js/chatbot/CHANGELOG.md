# @gradio/chatbot

## 0.2.2

### Fixes

- [#5319](https://github.com/gradio-app/gradio/pull/5319) [`3341148c`](https://github.com/gradio-app/gradio/commit/3341148c109b5458cc88435d27eb154210efc472) - Fix: wrap avatar-image in a div to clip its shape.  Thanks [@Keldos-Li](https://github.com/Keldos-Li)!

## 0.2.1

### Patch Changes

- Updated dependencies [[`31996c99`](https://github.com/gradio-app/gradio/commit/31996c991d6bfca8cef975eb8e3c9f61a7aced19)]:
  - @gradio/markdown@0.1.1

## 0.2.0

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
- [#5112](https://github.com/gradio-app/gradio/pull/5112) [`1cefee7f`](https://github.com/gradio-app/gradio/commit/1cefee7fc05175aca23ba04b3a3fda7b97f49bf0) - chore(deps): update dependency marked to v7. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5258](https://github.com/gradio-app/gradio/pull/5258) [`92282cea`](https://github.com/gradio-app/gradio/commit/92282cea6afdf7e9930ece1046d8a63be34b3cea) - Chatbot Avatar Images. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

### Fixes

- [#5242](https://github.com/gradio-app/gradio/pull/5242) [`2b397791`](https://github.com/gradio-app/gradio/commit/2b397791fe2059e4beb72937ff0436f2d4d28b4b) - Fix message text overflow onto copy button in `gr.Chatbot`. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5285](https://github.com/gradio-app/gradio/pull/5285) [`cdfd4217`](https://github.com/gradio-app/gradio/commit/cdfd42174a9c777eaee9c1209bf8e90d8c7791f2) - Tweaks to `icon` parameter in `gr.Button()`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5122](https://github.com/gradio-app/gradio/pull/5122) [`3b805346`](https://github.com/gradio-app/gradio/commit/3b8053469aca6c7a86a6731e641e4400fc34d7d3) - Allows code block in chatbot to scroll horizontally. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.1.0

### Features

- [#5125](https://github.com/gradio-app/gradio/pull/5125) [`80be7a1c`](https://github.com/gradio-app/gradio/commit/80be7a1ca44c0adef1668367b2cf36b65e52e576) - chatbot conversation nodes can contain a copy button. Thanks [@fazpu](https://github.com/fazpu)!
- [#5137](https://github.com/gradio-app/gradio/pull/5137) [`22aa5eba`](https://github.com/gradio-app/gradio/commit/22aa5eba3fee3f14473e4b0fac29cf72fe31ef04) - Use font size `--text-md` for `<code>` in Chatbot messages. Thanks [@jaywonchung](https://github.com/jaywonchung)!

## 0.0.2

### Patch Changes

- Updated dependencies [[`41c83070`](https://github.com/gradio-app/gradio/commit/41c83070b01632084e7d29123048a96c1e261407)]:
  - @gradio/theme@0.0.2
  - @gradio/utils@0.0.2
  - @gradio/atoms@0.0.2
  - @gradio/upload@0.0.2