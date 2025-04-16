# @gradio/utils

## 0.10.2

### Fixes

- [#11005](https://github.com/gradio-app/gradio/pull/11005) [`3def0ed`](https://github.com/gradio-app/gradio/commit/3def0ed9edc5a9194d69456948324ec4e2740b7d) - Ensure that the `.select()` event in `gr.DataFrame` carries the `.row_value` and `.col_value`.  Thanks @abidlabs!

## 0.10.1

### Dependency updates

- @gradio/theme@0.4.0

## 0.10.0

### Features

- [#10272](https://github.com/gradio-app/gradio/pull/10272) [`a1f2649`](https://github.com/gradio-app/gradio/commit/a1f2649586752a013fb4d36b83d5fea2e137bb81) - Chat Interface flagging and chatbot feedback.  Thanks @aliabid94!

## 0.9.0

### Features

- [#9979](https://github.com/gradio-app/gradio/pull/9979) [`e7629f7`](https://github.com/gradio-app/gradio/commit/e7629f7eacdc2a8960fae7472669b60405a4a06c) - Adds copy event to `gr.Markdown`, `gr.Chatbot`, and `gr.Textbox`.  Thanks @abidlabs!

## 0.8.0

### Features

- [#9950](https://github.com/gradio-app/gradio/pull/9950) [`fc06fe4`](https://github.com/gradio-app/gradio/commit/fc06fe41f015678a0545f4e5c99f6ae2704f0031) - Add ability to read and write from LocalStorage.  Thanks @abidlabs!

## 0.7.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Streaming Guides
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Prevent HTML and Markdown height changing when status is hidden
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Ssr part 2

### Dependencies

- @gradio/theme@0.3.0

## 0.7.0-beta.2

### Features

- [#9339](https://github.com/gradio-app/gradio/pull/9339) [`4c8c6f2`](https://github.com/gradio-app/gradio/commit/4c8c6f2fe603081941c5fdc43f48a0632b9f31ad) - Ssr part 2.  Thanks @pngwn!
- [#9363](https://github.com/gradio-app/gradio/pull/9363) [`3ad28c7`](https://github.com/gradio-app/gradio/commit/3ad28c7e310e8589e0c53b7efee8031e129bece8) - Prevent HTML and Markdown height changing when status is hidden.  Thanks @hannahblair!

## 0.7.0-beta.1

### Features

- [#9187](https://github.com/gradio-app/gradio/pull/9187) [`5bf00b7`](https://github.com/gradio-app/gradio/commit/5bf00b7524ebf399b48719120a49d15bb21bd65c) - make all component SSR compatible.  Thanks @pngwn!

### Dependency updates

- @gradio/theme@0.3.0-beta.1

## 0.7.0

### Features

- [#9173](https://github.com/gradio-app/gradio/pull/9173) [`66349fe`](https://github.com/gradio-app/gradio/commit/66349fe26827e3a3c15b738a1177e95fec7f5554) - Streaming Guides.  Thanks @freddyaboulton!

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/theme@0.2.5

## 0.6.0

### Features

- [#9128](https://github.com/gradio-app/gradio/pull/9128) [`747013b`](https://github.com/gradio-app/gradio/commit/747013bbacebae6bfdda554b45e541e80b2894e0) - Allow accessing the entire row of selected values in `gr.DataFrame`.  Thanks @abidlabs!
- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!

### Dependency updates

- @gradio/theme@0.2.4

## 0.5.2

### Fixes

- [#8927](https://github.com/gradio-app/gradio/pull/8927) [`223688b`](https://github.com/gradio-app/gradio/commit/223688b70a7a3cf4daa92ae77f8fca7b537cc2b4) - Fix `Could not resolve "virtual:component-loader"` in gradio/utils package.  Thanks @benzler!

## 0.5.1

### Fixes

- [#8737](https://github.com/gradio-app/gradio/pull/8737) [`31a876d`](https://github.com/gradio-app/gradio/commit/31a876d0274d7b74a90d30148f3e9c098f486242) - Fix `Share to community` button for images.  Thanks @hannahblair!

## 0.5.0

### Features

- [#8131](https://github.com/gradio-app/gradio/pull/8131) [`bb504b4`](https://github.com/gradio-app/gradio/commit/bb504b494947a287d6386e0e7ead3860c0f15223) - Gradio components in `gr.Chatbot()`.  Thanks @dawoodkhan82!

## 0.4.2

### Dependency updates

- @gradio/theme@0.2.3

## 0.4.1

### Fixes

- [#8179](https://github.com/gradio-app/gradio/pull/8179) [`6a218b4`](https://github.com/gradio-app/gradio/commit/6a218b4148095aaa0c58d8c20973ba01c8764fc2) - rework upload to be a class method + pass client into each component.  Thanks @pngwn!

## 0.4.0

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

## 0.3.2

### Dependency updates

- @gradio/theme@0.2.2

## 0.3.1

### Dependency updates

- @gradio/theme@0.2.1

## 0.3.0

### Fixes

- [#7404](https://github.com/gradio-app/gradio/pull/7404) [`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7) - Add `.key_up` event listener to `gr.Dropdown()`.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.2.2

### Features

- [#7274](https://github.com/gradio-app/gradio/pull/7274) [`fdd1521`](https://github.com/gradio-app/gradio/commit/fdd15213c24b9cbc58bbc1b6beb4af7c18f48557) - chore: Change time format (thanks @jjshoots for the independent contribution).  Thanks [@arian81](https://github.com/arian81)!

## 0.2.1

### Fixes

- [#7126](https://github.com/gradio-app/gradio/pull/7126) [`5727b92`](https://github.com/gradio-app/gradio/commit/5727b92abc8a00a675bfc0a921b38de771af947b) - Allow buttons to take null value.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.2.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Improve Audio Component.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.6

### Features

- [#6136](https://github.com/gradio-app/gradio/pull/6136) [`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a) - JS Component Documentation.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.2.0-beta.5

### Features

- [#5966](https://github.com/gradio-app/gradio/pull/5966) [`9cad2127b`](https://github.com/gradio-app/gradio/commit/9cad2127b965023687470b3abfe620e188a9da6e) - Improve Audio Component.  Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.4

### Features

- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.1.2

### Patch Changes

- Updated dependencies [[`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e)]:
  - @gradio/theme@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/theme@0.1.0

## 0.1.0

### Highlights

#### Like/Dislike Button for Chatbot ([#5391](https://github.com/gradio-app/gradio/pull/5391) [`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db))

Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

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

- Updated dependencies [[`41c83070`](https://github.com/gradio-app/gradio/commit/41c83070b01632084e7d29123048a96c1e261407)]:
  - @gradio/theme@0.0.2