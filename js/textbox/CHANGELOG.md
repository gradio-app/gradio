# @gradio/textbox

## 0.8.4

### Dependency updates

- @gradio/statustracker@0.9.3
- @gradio/atoms@0.10.1

## 0.8.3

### Dependency updates

- @gradio/statustracker@0.9.2
- @gradio/atoms@0.10.0
- @gradio/icons@0.8.1

## 0.8.2

### Dependency updates

- @gradio/statustracker@0.9.1
- @gradio/atoms@0.9.2

## 0.8.1

### Dependency updates

- @gradio/atoms@0.9.1
- @gradio/statustracker@0.9.0

## 0.8.0

### Features

- [#9677](https://github.com/gradio-app/gradio/pull/9677) [`3a19e69`](https://github.com/gradio-app/gradio/commit/3a19e690ef8de12c4494429d52988b863065eed3) - Revert text disable.  Thanks @whitphx!

## 0.7.1

### Features

- [#9626](https://github.com/gradio-app/gradio/pull/9626) [`ec95b02`](https://github.com/gradio-app/gradio/commit/ec95b0212b3ce2bf1a14af92fcd40d15052dd672) - Fix stopping chat interface when stop button is clicked.  Thanks @aliabid94!

### Dependency updates

- @gradio/statustracker@0.8.1

## 0.7.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Adding new themes to Gradio 5.0
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Built-in submit and stop buttons in `gr.ChatInterface(multimodal=False)`, adding `submit_btn` and `stop_btn` props to `gr.Textbox()` and `gr.MultimodalText()`
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Chatbot Examples
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Allow `info=` to render markdown
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Disable the submit button and enter-key submit when the text is empty
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Match style of textbox stop button to submit button

### Fixes


- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Set the color of placeholder in a disabled textbox to gray instead of black, and disable typing while a response is generating in `gr.ChatInterface`, allow `gr.MultimodalTextbox` to accept string values

### Dependencies

- @gradio/atoms@0.9.0
- @gradio/icons@0.8.0
- @gradio/statustracker@0.8.0
- @gradio/utils@0.7.0

## 0.7.0-beta.5

### Features

- [#9437](https://github.com/gradio-app/gradio/pull/9437) [`c3d93be`](https://github.com/gradio-app/gradio/commit/c3d93bef94b9401747a363f7bad88a1d347d535b) - Adding new themes to Gradio 5.0.  Thanks @allisonwhilden!
- [#9583](https://github.com/gradio-app/gradio/pull/9583) [`b92a762`](https://github.com/gradio-app/gradio/commit/b92a7623e1ebd801587041e1ccca058a61058da9) - Disable the submit button and enter-key submit when the text is empty.  Thanks @whitphx!

### Dependency updates

- @gradio/statustracker@0.8.0-beta.5
- @gradio/icons@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.5

## 0.7.0-beta.4

### Features

- [#9521](https://github.com/gradio-app/gradio/pull/9521) [`06ef22e`](https://github.com/gradio-app/gradio/commit/06ef22e83cdd27e7afb381396d153d9db3dea16e) - Allow `info=` to render markdown.  Thanks @dawoodkhan82!

### Dependency updates

- @gradio/statustracker@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.4

## 0.7.0-beta.3

### Dependency updates

- @gradio/statustracker@0.8.0-beta.3
- @gradio/icons@0.8.0-beta.3
- @gradio/atoms@0.9.0-beta.3

## 0.7.0-beta.2

### Dependency updates

- @gradio/statustracker@0.8.0-beta.2

## 0.7.0-beta.2

### Features

- [#8966](https://github.com/gradio-app/gradio/pull/8966) [`8e52b6a`](https://github.com/gradio-app/gradio/commit/8e52b6a3e75957462bc7fdbf6ff9c280084d5f08) - Chatbot Examples.  Thanks @dawoodkhan82!
- [#9280](https://github.com/gradio-app/gradio/pull/9280) [`7122420`](https://github.com/gradio-app/gradio/commit/712242047fde3a594dfde7f48a44c7ea16239dc8) - Match style of textbox stop button to submit button.  Thanks @freddyaboulton!

### Fixes

- [#9328](https://github.com/gradio-app/gradio/pull/9328) [`6a7f631`](https://github.com/gradio-app/gradio/commit/6a7f63180b4105622298dd742d6a0d25216ea629) - Set the color of placeholder in a disabled textbox to gray instead of black, and disable typing while a response is generating in `gr.ChatInterface`, allow `gr.MultimodalTextbox` to accept string values.  Thanks @abidlabs!

### Dependency updates

- @gradio/atoms@0.9.0-beta.2
- @gradio/icons@0.8.0-beta.2
- @gradio/statustracker@0.8.0-beta.2
- @gradio/utils@0.7.0-beta.2

## 0.7.0-beta.1

### Features

- [#9235](https://github.com/gradio-app/gradio/pull/9235) [`f8b411f`](https://github.com/gradio-app/gradio/commit/f8b411fe282ff0316ed4abebc0a043b044bf4dd9) - Built-in submit and stop buttons in `gr.ChatInterface(multimodal=False)`, adding `submit_btn` and `stop_btn` props to `gr.Textbox()` and `gr.MultimodalText()`.  Thanks @whitphx!

### Dependency updates

- @gradio/atoms@0.8.1-beta.1
- @gradio/icons@0.8.0-beta.1
- @gradio/statustracker@0.8.0-beta.1
- @gradio/utils@0.7.0-beta.1

## 0.7.0

### Features

- [#9185](https://github.com/gradio-app/gradio/pull/9185) [`2daf3d1`](https://github.com/gradio-app/gradio/commit/2daf3d10f5986675f6ceb75ebb50c9d991c282bf) - Adding `maxlength` attribute handling of `textarea` and `input` HTML element for the `gr.TextBox()` component via a `max_length` parameter.  Thanks @WH-Yoshi!

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.1
- @gradio/statustracker@0.7.6
- @gradio/atoms@0.8.1
- @gradio/icons@0.7.2

## 0.6.11

### Features

- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.0
- @gradio/atoms@0.8.0
- @gradio/statustracker@0.7.5
- @gradio/icons@0.7.1

## 0.6.10

### Dependency updates

- @gradio/atoms@0.7.9
- @gradio/statustracker@0.7.4
- @gradio/icons@0.7.0

## 0.6.9

### Dependency updates

- @gradio/atoms@0.7.8
- @gradio/icons@0.6.1
- @gradio/utils@0.5.2
- @gradio/statustracker@0.7.3

## 0.6.8

### Dependency updates

- @gradio/statustracker@0.7.2
- @gradio/atoms@0.7.7

## 0.6.7

### Dependency updates

- @gradio/atoms@0.7.6
- @gradio/utils@0.5.1
- @gradio/statustracker@0.7.1
- @gradio/icons@0.6.0

## 0.6.6

### Dependency updates

- @gradio/atoms@0.7.5
- @gradio/utils@0.5.0
- @gradio/icons@0.5.0
- @gradio/statustracker@0.7.0

## 0.6.5

### Dependency updates

- @gradio/statustracker@0.6.0

## 0.6.5

### Dependency updates

- @gradio/statustracker@0.6.0

## 0.6.4

### Dependency updates

- @gradio/utils@0.4.2
- @gradio/atoms@0.7.4
- @gradio/statustracker@0.5.5

## 0.6.3

### Dependency updates

- @gradio/statustracker@0.5.4

## 0.6.2

### Dependency updates

- @gradio/statustracker@0.5.3

## 0.6.1

### Dependency updates

- @gradio/atoms@0.7.3
- @gradio/statustracker@0.5.2
- @gradio/icons@0.4.1

## 0.6.0

### Features

- [#8121](https://github.com/gradio-app/gradio/pull/8121) [`f5b710c`](https://github.com/gradio-app/gradio/commit/f5b710c919b0ce604ea955f0d5f4faa91095ca4a) - chore(deps): update dependency eslint to v9.  Thanks @renovate!

### Dependency updates

- @gradio/atoms@0.7.2
- @gradio/utils@0.4.1
- @gradio/statustracker@0.5.1

## 0.5.0

### Highlights

#### Setting File Upload Limits ([#7909](https://github.com/gradio-app/gradio/pull/7909) [`2afca65`](https://github.com/gradio-app/gradio/commit/2afca6541912b37dc84f447c7ad4af21607d7c72))

We have added a `max_file_size` size parameter to `launch()` that limits to size of files uploaded to the server. This limit applies to each individual file. This parameter can be specified as a string or an integer (corresponding to the size in bytes).

The following code snippet sets a max file size of 5 megabytes.

```python
import gradio as gr

demo = gr.Interface(lambda x: x, "image", "image")

demo.launch(max_file_size="5mb")
# or
demo.launch(max_file_size=5 * gr.FileSize.MB)
```

![max_file_size_upload](https://github.com/gradio-app/gradio/assets/41651716/7547330c-a082-4901-a291-3f150a197e45)


#### Error states can now be cleared

When a component encounters an error, the error state shown in the UI can now be cleared by clicking on the `x` icon in the top right of the component. This applies to all types of errors, whether it's raised in the UI or the server.

![error_modal_calculator](https://github.com/gradio-app/gradio/assets/41651716/16cb071c-accd-45a6-9c18-0dea27d4bd98)

 Thanks @freddyaboulton!

### Fixes

- [#8066](https://github.com/gradio-app/gradio/pull/8066) [`624f9b9`](https://github.com/gradio-app/gradio/commit/624f9b9477f74a581a6c14119234f9efdfcda398) - make gradio dev tools a local dependency rather than bundling.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.1
- @gradio/statustracker@0.5.0
- @gradio/utils@0.4.0

## 0.4.16

### Dependency updates

- @gradio/utils@0.3.2
- @gradio/statustracker@0.4.12
- @gradio/atoms@0.7.0
- @gradio/icons@0.4.0

## 0.4.15

### Dependency updates

- @gradio/utils@0.3.1
- @gradio/atoms@0.6.2
- @gradio/statustracker@0.4.11

## 0.4.14

### Dependency updates

- @gradio/atoms@0.6.1
- @gradio/statustracker@0.4.10
- @gradio/icons@0.3.4

## 0.4.13

### Dependency updates

- @gradio/statustracker@0.4.9
- @gradio/atoms@0.6.0

## 0.4.12

### Patch Changes

- Updated dependencies [[`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89)]:
  - @gradio/statustracker@0.4.8

## 0.4.11

### Patch Changes

- Updated dependencies [[`f191786`](https://github.com/gradio-app/gradio/commit/f1917867916647d383b8d7ce15e0c17f2abbdec1)]:
  - @gradio/icons@0.3.3
  - @gradio/atoms@0.5.3
  - @gradio/statustracker@0.4.7

## 0.4.10

### Patch Changes

- Updated dependencies [[`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7)]:
  - @gradio/utils@0.3.0
  - @gradio/atoms@0.5.2
  - @gradio/statustracker@0.4.6

## 0.4.9

### Fixes

- [#7192](https://github.com/gradio-app/gradio/pull/7192) [`8dd6f4b`](https://github.com/gradio-app/gradio/commit/8dd6f4bc1901792f05cd59e86df7b1dbab692739) - Handle the case where examples is `null` for all components. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.4.8

### Patch Changes

- Updated dependencies [[`5727b92`](https://github.com/gradio-app/gradio/commit/5727b92abc8a00a675bfc0a921b38de771af947b), [`c60ad4d`](https://github.com/gradio-app/gradio/commit/c60ad4d34ab5b56a89bf6796822977e51e7a4a32)]:
  - @gradio/utils@0.2.1
  - @gradio/atoms@0.5.0
  - @gradio/statustracker@0.4.4

## 0.4.7

### Patch Changes

- Updated dependencies [[`828fb9e`](https://github.com/gradio-app/gradio/commit/828fb9e6ce15b6ea08318675a2361117596a1b5d), [`73268ee`](https://github.com/gradio-app/gradio/commit/73268ee2e39f23ebdd1e927cb49b8d79c4b9a144)]:
  - @gradio/statustracker@0.4.3
  - @gradio/atoms@0.4.1

## 0.4.6

### Patch Changes

- Updated dependencies [[`053bec9`](https://github.com/gradio-app/gradio/commit/053bec98be1127e083414024e02cf0bebb0b5142), [`4d1cbbc`](https://github.com/gradio-app/gradio/commit/4d1cbbcf30833ef1de2d2d2710c7492a379a9a00)]:
  - @gradio/icons@0.3.2
  - @gradio/atoms@0.4.0
  - @gradio/statustracker@0.4.2

## 0.4.5

### Fixes

- [#6635](https://github.com/gradio-app/gradio/pull/6635) [`b639e04`](https://github.com/gradio-app/gradio/commit/b639e040741e6c0d9104271c81415d7befbd8cf3) - Quick Image + Text Component Fixes. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.4.4

### Patch Changes

- Updated dependencies [[`9caddc17b`](https://github.com/gradio-app/gradio/commit/9caddc17b1dea8da1af8ba724c6a5eab04ce0ed8)]:
  - @gradio/atoms@0.3.0
  - @gradio/icons@0.3.0
  - @gradio/statustracker@0.4.0

## 0.4.3

### Patch Changes

- Updated dependencies [[`f816136a0`](https://github.com/gradio-app/gradio/commit/f816136a039fa6011be9c4fb14f573e4050a681a)]:
  - @gradio/atoms@0.2.2
  - @gradio/icons@0.2.1
  - @gradio/statustracker@0.3.2

## 0.4.2

### Fixes

- [#6323](https://github.com/gradio-app/gradio/pull/6323) [`55fda81fa`](https://github.com/gradio-app/gradio/commit/55fda81fa5918b48952729232d6e2fc55af9351d) - Textbox and Code Component Blur/Focus Fixes. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.4.1

### Patch Changes

- Updated dependencies [[`3cdeabc68`](https://github.com/gradio-app/gradio/commit/3cdeabc6843000310e1a9e1d17190ecbf3bbc780), [`fad92c29d`](https://github.com/gradio-app/gradio/commit/fad92c29dc1f5cd84341aae417c495b33e01245f)]:
  - @gradio/atoms@0.2.1
  - @gradio/statustracker@0.3.1

## 0.4.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.0-beta.8

### Features

- [#6136](https://github.com/gradio-app/gradio/pull/6136) [`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a) - JS Component Documentation. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6149](https://github.com/gradio-app/gradio/pull/6149) [`90318b1dd`](https://github.com/gradio-app/gradio/commit/90318b1dd118ae08a695a50e7c556226234ab6dc) - swap `mode` on the frontned to `interactive` to match the backend. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.0-beta.7

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.0-beta.6

### Features

- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files. Thanks [@pngwn](https://github.com/pngwn)!
- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.4.3

### Patch Changes

- Updated dependencies [[`e70805d54`](https://github.com/gradio-app/gradio/commit/e70805d54cc792452545f5d8eccc1aa0212a4695)]:
  - @gradio/atoms@0.2.0
  - @gradio/statustracker@0.2.3

## 0.4.2

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.1.2
  - @gradio/atoms@0.1.4
  - @gradio/statustracker@0.2.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2)]:
  - @gradio/icons@0.2.0
  - @gradio/atoms@0.1.3
  - @gradio/statustracker@0.2.1

## 0.4.0

### Features

- [#5652](https://github.com/gradio-app/gradio/pull/5652) [`2e25d4305`](https://github.com/gradio-app/gradio/commit/2e25d430582264945ae3316acd04c4453a25ce38) - Pause autoscrolling if a user scrolls up in a `gr.Textbox` and resume autoscrolling if they go all the way down. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.3.0

### Features

- [#5488](https://github.com/gradio-app/gradio/pull/5488) [`8909e42a`](https://github.com/gradio-app/gradio/commit/8909e42a7c6272358ad413588d27a5124d151205) - Adds `autoscroll` param to `gr.Textbox()`. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.2.0

### Features

- [#5417](https://github.com/gradio-app/gradio/pull/5417) [`d14d63e3`](https://github.com/gradio-app/gradio/commit/d14d63e30c4af3f9c2a664fd11b0a01943a8300c) - Auto scroll to bottom of textbox. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.1.3

### Patch Changes

- Updated dependencies [[`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db)]:
  - @gradio/icons@0.1.0
  - @gradio/utils@0.1.0
  - @gradio/atoms@0.1.1
  - @gradio/statustracker@0.1.1

## 0.1.2

### Fixes

- [#5324](https://github.com/gradio-app/gradio/pull/5324) [`31996c99`](https://github.com/gradio-app/gradio/commit/31996c991d6bfca8cef975eb8e3c9f61a7aced19) - ensure login form has correct styles. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.1

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

## 0.1.0

### Features

- [#5005](https://github.com/gradio-app/gradio/pull/5005) [`f5539c76`](https://github.com/gradio-app/gradio/commit/f5539c7618e31451420bd3228754774da14dc65f) - Enhancement: Add focus event to textbox and number component. Thanks [@JodyZ0203](https://github.com/JodyZ0203)!

### Fixes

- [#5114](https://github.com/gradio-app/gradio/pull/5114) [`56d2609d`](https://github.com/gradio-app/gradio/commit/56d2609de93387a75dc82b1c06c1240c5b28c0b8) - Reset textbox value to empty string when value is None. Thanks [@hannahblair](https://github.com/hannahblair)!