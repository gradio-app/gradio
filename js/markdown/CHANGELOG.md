# @gradio/markdown

## 0.7.4

### Dependency updates

- @gradio/statustracker@0.5.4

## 0.7.3

### Dependency updates

- @gradio/statustracker@0.5.3

## 0.7.2

### Features

- [#8226](https://github.com/gradio-app/gradio/pull/8226) [`892181b`](https://github.com/gradio-app/gradio/commit/892181b4fdb13dd6048a620dd985d47bc3c26ed7) - chore(deps): update dependency @types/prismjs to v1.26.4.  Thanks @renovate!

### Dependency updates

- @gradio/atoms@0.7.3
- @gradio/statustracker@0.5.2

## 0.7.1

### Dependency updates

- @gradio/atoms@0.7.2
- @gradio/utils@0.4.1
- @gradio/statustracker@0.5.1

## 0.7.0

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

## 0.6.10

### Dependency updates

- @gradio/utils@0.3.2
- @gradio/statustracker@0.4.12
- @gradio/atoms@0.7.0

## 0.6.9

### Features

- [#7936](https://github.com/gradio-app/gradio/pull/7936) [`b165193`](https://github.com/gradio-app/gradio/commit/b165193902985b77a732ed703423ebebeaf0da27) - Restore Markdown formatting for Chatbots, MarkdownCode.  Thanks @aliabid94!

### Dependency updates

- @gradio/utils@0.3.1
- @gradio/atoms@0.6.2
- @gradio/statustracker@0.4.11

## 0.6.8

### Dependency updates

- @gradio/atoms@0.6.1
- @gradio/statustracker@0.4.10

## 0.6.7

### Dependency updates

- @gradio/statustracker@0.4.9
- @gradio/atoms@0.6.0

## 0.6.6

### Fixes

- [#7623](https://github.com/gradio-app/gradio/pull/7623) [`c9aba8d`](https://github.com/gradio-app/gradio/commit/c9aba8d8a5886ef6456479154a14c69188c20413) - Fixes: gr.Markdown is not updated properly when it has an image tag.  Thanks @dawoodkhan82!

## 0.6.5

### Patch Changes

- Updated dependencies [[`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89)]:
  - @gradio/statustracker@0.4.8

## 0.6.4

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.5.3
  - @gradio/statustracker@0.4.7

## 0.6.3

### Fixes

- [#7361](https://github.com/gradio-app/gradio/pull/7361) [`17fb116`](https://github.com/gradio-app/gradio/commit/17fb116492f951ab66e3a39b5fdfb598f5446b6f) - Fixes gr.Markdown() does not render spaces around links correctly. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.6.2

### Features

- [#7298](https://github.com/gradio-app/gradio/pull/7298) [`e5344ba`](https://github.com/gradio-app/gradio/commit/e5344ba0cd63d21dbb525330bbc07ca2eca57832) - chore(deps): update dependency marked to v12. Thanks [@renovate](https://github.com/apps/renovate)!

### Fixes

- [#7192](https://github.com/gradio-app/gradio/pull/7192) [`8dd6f4b`](https://github.com/gradio-app/gradio/commit/8dd6f4bc1901792f05cd59e86df7b1dbab692739) - Handle the case where examples is `null` for all components. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.6.1

### Fixes

- [#7138](https://github.com/gradio-app/gradio/pull/7138) [`ca8753b`](https://github.com/gradio-app/gradio/commit/ca8753bb3d829d0077f758ba8d0ddc866ff74d3d) - Fixes: Chatbot crashes when given empty url following http:// or https://. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.6.0

### Features

- [#6842](https://github.com/gradio-app/gradio/pull/6842) [`846d52d`](https://github.com/gradio-app/gradio/commit/846d52d1c92d429077382ce494eea27fd062d9f6) - Fix md highlight. Thanks [@pngwn](https://github.com/pngwn)!
- [#6831](https://github.com/gradio-app/gradio/pull/6831) [`f3abde8`](https://github.com/gradio-app/gradio/commit/f3abde80884d96ad69b825020c46486d9dd5cac5) - Add an option to enable header links for markdown. Thanks [@pngwn](https://github.com/pngwn)!

## 0.5.0

### Features

- [#6603](https://github.com/gradio-app/gradio/pull/6603) [`6b1401c`](https://github.com/gradio-app/gradio/commit/6b1401c514c2ec012b0a50c72a6ec81cb673bf1d) - chore(deps): update dependency marked to v11. Thanks [@renovate](https://github.com/apps/renovate)!

## 0.4.1

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.3.1
  - @gradio/statustracker@0.4.1

## 0.4.0

### Features

- [#6537](https://github.com/gradio-app/gradio/pull/6537) [`6d3fecfa4`](https://github.com/gradio-app/gradio/commit/6d3fecfa42dde1c70a60c397434c88db77289be6) - chore(deps): update all non-major dependencies. Thanks [@renovate](https://github.com/apps/renovate)!

## 0.3.4

### Features

- [#6296](https://github.com/gradio-app/gradio/pull/6296) [`46f13f496`](https://github.com/gradio-app/gradio/commit/46f13f4968c8177e318c9d75f2eed1ed55c2c042) - chore(deps): update all non-major dependencies. Thanks [@renovate](https://github.com/apps/renovate)!

## 0.3.3

### Patch Changes

- Updated dependencies [[`9caddc17b`](https://github.com/gradio-app/gradio/commit/9caddc17b1dea8da1af8ba724c6a5eab04ce0ed8)]:
  - @gradio/atoms@0.3.0
  - @gradio/statustracker@0.4.0

## 0.3.2

### Patch Changes

- Updated dependencies [[`f816136a0`](https://github.com/gradio-app/gradio/commit/f816136a039fa6011be9c4fb14f573e4050a681a)]:
  - @gradio/atoms@0.2.2
  - @gradio/statustracker@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies [[`3cdeabc68`](https://github.com/gradio-app/gradio/commit/3cdeabc6843000310e1a9e1d17190ecbf3bbc780), [`fad92c29d`](https://github.com/gradio-app/gradio/commit/fad92c29dc1f5cd84341aae417c495b33e01245f)]:
  - @gradio/atoms@0.2.1
  - @gradio/statustracker@0.3.1

## 0.3.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Remove duplicate `elem_ids` from components. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.0-beta.8

### Features

- [#6136](https://github.com/gradio-app/gradio/pull/6136) [`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a) - JS Component Documentation. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6152](https://github.com/gradio-app/gradio/pull/6152) [`982bff2fd`](https://github.com/gradio-app/gradio/commit/982bff2fdd938b798c400fb90d1cf0caf7278894) - Remove duplicate `elem_ids` from components. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.3.0-beta.7

### Features

- [#6071](https://github.com/gradio-app/gradio/pull/6071) [`f08da1a6f`](https://github.com/gradio-app/gradio/commit/f08da1a6f288f6ab8ec40534d5a9e2c64bed4b3b) - Fixes markdown rendering in examples. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests. Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.0-beta.6

### Features

- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files. Thanks [@pngwn](https://github.com/pngwn)!
- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.3.2

### Fixes

- [#5897](https://github.com/gradio-app/gradio/pull/5897) [`0592c301d`](https://github.com/gradio-app/gradio/commit/0592c301df9cd949b52159c85b7042f38d113e86) - Fix Dataframe `line_breaks`. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5878](https://github.com/gradio-app/gradio/pull/5878) [`fbce277e5`](https://github.com/gradio-app/gradio/commit/fbce277e50c5885371fd49c68adf8565c25c1d39) - Keep Markdown rendered lists within dataframe cells. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.3.1

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.1.2
  - @gradio/atoms@0.1.4
  - @gradio/statustracker@0.2.2

## 0.3.0

### Fixes

- [#5755](https://github.com/gradio-app/gradio/pull/5755) [`e842a561a`](https://github.com/gradio-app/gradio/commit/e842a561af4394f8109291ee5725bcf74743e816) - Fix new line issue in chatbot. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.2.2

### Fixes

- [#5701](https://github.com/gradio-app/gradio/pull/5701) [`ee8eec1e5`](https://github.com/gradio-app/gradio/commit/ee8eec1e5e544a0127e0aa68c2522a7085b8ada5) - Fix for regression in rendering empty Markdown. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.2.1

### Features

- [#5671](https://github.com/gradio-app/gradio/pull/5671) [`6a36c3b78`](https://github.com/gradio-app/gradio/commit/6a36c3b786700600d3826ce1e0629cc5308ddd47) - chore(deps): update dependency @types/prismjs to v1.26.1. Thanks [@renovate](https://github.com/apps/renovate)!

### Fixes

- [#5604](https://github.com/gradio-app/gradio/pull/5604) [`faad01f8e`](https://github.com/gradio-app/gradio/commit/faad01f8e10ef6d18249b1a4587477c59b74adb2) - Add `render_markdown` parameter to chatbot. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.2.0

### Features

- [#5342](https://github.com/gradio-app/gradio/pull/5342) [`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912) - significantly improve the performance of `gr.Dataframe` for large datasets. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.2

### Fixes

- [#5304](https://github.com/gradio-app/gradio/pull/5304) [`05892302`](https://github.com/gradio-app/gradio/commit/05892302fb8fe2557d57834970a2b65aea97355b) - Adds kwarg to disable html sanitization in `gr.Chatbot()`. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5393](https://github.com/gradio-app/gradio/pull/5393) [`e4e7a431`](https://github.com/gradio-app/gradio/commit/e4e7a4319924aaf51dcb18d07d0c9953d4011074) - Renders LaTeX that is added to the page in `gr.Markdown`, `gr.Chatbot`, and `gr.DataFrame`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5394](https://github.com/gradio-app/gradio/pull/5394) [`4d94ea0a`](https://github.com/gradio-app/gradio/commit/4d94ea0a0cf2103cda19f48398a5634f8341d04d) - Adds horizontal scrolling to content that overflows in gr.Markdown. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5368](https://github.com/gradio-app/gradio/pull/5368) [`b27f7583`](https://github.com/gradio-app/gradio/commit/b27f7583254165b135bf1496a7d8c489a62ba96f) - Change markdown rendering to set breaks to false. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.1

### Fixes

- [#5324](https://github.com/gradio-app/gradio/pull/5324) [`31996c99`](https://github.com/gradio-app/gradio/commit/31996c991d6bfca8cef975eb8e3c9f61a7aced19) - ensure login form has correct styles. Thanks [@pngwn](https://github.com/pngwn)!

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

- [#5268](https://github.com/gradio-app/gradio/pull/5268) [`f49028cf`](https://github.com/gradio-app/gradio/commit/f49028cfe3e21097001ddbda71c560b3d8b42e1c) - Move markdown & latex processing to the frontend for the gr.Markdown and gr.DataFrame components. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5215](https://github.com/gradio-app/gradio/pull/5215) [`fbdad78a`](https://github.com/gradio-app/gradio/commit/fbdad78af4c47454cbb570f88cc14bf4479bbceb) - Lazy load interactive or static variants of a component individually, rather than loading both variants regardless. This change will improve performance for many applications. Thanks [@pngwn](https://github.com/pngwn)!