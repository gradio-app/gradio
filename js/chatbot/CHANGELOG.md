# @gradio/chatbot

## 0.5.2

### Patch Changes

- Updated dependencies [[`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e)]:
  - @gradio/theme@0.2.0
  - @gradio/utils@0.1.2
  - @gradio/atoms@0.1.4
  - @gradio/markdown@0.3.1
  - @gradio/statustracker@0.2.2
  - @gradio/upload@0.3.2

## 0.5.1

### Fixes

- [#5775](https://github.com/gradio-app/gradio/pull/5775) [`e2874bc3c`](https://github.com/gradio-app/gradio/commit/e2874bc3cb1397574f77dbd7f0408ed4e6792970) - fix pending chatbot message styling and ensure messages with value `None` don't render. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.5.0

### Features

- [#5699](https://github.com/gradio-app/gradio/pull/5699) [`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2) - Improve chatbot accessibility and UX. Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#5755](https://github.com/gradio-app/gradio/pull/5755) [`e842a561a`](https://github.com/gradio-app/gradio/commit/e842a561af4394f8109291ee5725bcf74743e816) - Fix new line issue in chatbot. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.4.1

### Patch Changes

- Updated dependencies [[`ee8eec1e5`](https://github.com/gradio-app/gradio/commit/ee8eec1e5e544a0127e0aa68c2522a7085b8ada5)]:
  - @gradio/markdown@0.2.2

## 0.4.0

### Features

- [#5671](https://github.com/gradio-app/gradio/pull/5671) [`6a36c3b78`](https://github.com/gradio-app/gradio/commit/6a36c3b786700600d3826ce1e0629cc5308ddd47) - chore(deps): update dependency @types/prismjs to v1.26.1. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements. Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#5604](https://github.com/gradio-app/gradio/pull/5604) [`faad01f8e`](https://github.com/gradio-app/gradio/commit/faad01f8e10ef6d18249b1a4587477c59b74adb2) - Add `render_markdown` parameter to chatbot. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5593](https://github.com/gradio-app/gradio/pull/5593) [`88d43bd12`](https://github.com/gradio-app/gradio/commit/88d43bd124792d216da445adef932a2b02f5f416) - Fixes avatar image in chatbot being squashed. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.3.2

### Fixes

- [#5470](https://github.com/gradio-app/gradio/pull/5470) [`a4e010a9`](https://github.com/gradio-app/gradio/commit/a4e010a96f1d8a52b3ac645e03fe472b9c3cbbb1) - Fix share button position. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.3.1

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/markdown@0.2.0
  - @gradio/statustracker@0.2.0
  - @gradio/theme@0.1.0
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2
  - @gradio/upload@0.2.1

## 0.3.0

### Highlights

#### Like/Dislike Button for Chatbot ([#5391](https://github.com/gradio-app/gradio/pull/5391) [`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db))

Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

### Features

- [#5334](https://github.com/gradio-app/gradio/pull/5334) [`c5bf9138`](https://github.com/gradio-app/gradio/commit/c5bf91385a632dc9f612499ee01166ac6ae509a9) - Add chat bubble width param. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

### Fixes

- [#5304](https://github.com/gradio-app/gradio/pull/5304) [`05892302`](https://github.com/gradio-app/gradio/commit/05892302fb8fe2557d57834970a2b65aea97355b) - Adds kwarg to disable html sanitization in `gr.Chatbot()`. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5366](https://github.com/gradio-app/gradio/pull/5366) [`0cc7e2dc`](https://github.com/gradio-app/gradio/commit/0cc7e2dcf60e216e0a30e2f85a9879ce3cb2a1bd) - Hide avatar when message none. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.2.2

### Fixes

- [#5319](https://github.com/gradio-app/gradio/pull/5319) [`3341148c`](https://github.com/gradio-app/gradio/commit/3341148c109b5458cc88435d27eb154210efc472) - Fix: wrap avatar-image in a div to clip its shape. Thanks [@Keldos-Li](https://github.com/Keldos-Li)!

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
