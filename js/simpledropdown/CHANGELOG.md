# @gradio/simpledropdown

## 0.3.5

### Dependency updates

- @gradio/statustracker@0.9.3
- @gradio/atoms@0.10.1

## 0.3.4

### Dependency updates

- @gradio/statustracker@0.9.2
- @gradio/atoms@0.10.0
- @gradio/icons@0.8.1

## 0.3.3

### Dependency updates

- @gradio/statustracker@0.9.1
- @gradio/atoms@0.9.2

## 0.3.2

### Dependency updates

- @gradio/atoms@0.9.1
- @gradio/statustracker@0.9.0

## 0.3.1

### Dependency updates

- @gradio/statustracker@0.8.1

## 0.3.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Allow `info=` to render markdown

### Dependencies

- @gradio/atoms@0.9.0
- @gradio/icons@0.8.0
- @gradio/statustracker@0.8.0
- @gradio/utils@0.7.0

## 0.3.0-beta.5

### Dependency updates

- @gradio/statustracker@0.8.0-beta.5
- @gradio/icons@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.5

## 0.3.0-beta.4

### Features

- [#9521](https://github.com/gradio-app/gradio/pull/9521) [`06ef22e`](https://github.com/gradio-app/gradio/commit/06ef22e83cdd27e7afb381396d153d9db3dea16e) - Allow `info=` to render markdown.  Thanks @dawoodkhan82!

### Dependency updates

- @gradio/statustracker@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.4

## 0.2.13-beta.3

### Dependency updates

- @gradio/statustracker@0.8.0-beta.3
- @gradio/icons@0.8.0-beta.3
- @gradio/atoms@0.9.0-beta.3

## 0.2.13-beta.2

### Dependency updates

- @gradio/statustracker@0.8.0-beta.2

## 0.2.13-beta.2

### Dependency updates

- @gradio/atoms@0.9.0-beta.2
- @gradio/icons@0.8.0-beta.2
- @gradio/statustracker@0.8.0-beta.2
- @gradio/utils@0.7.0-beta.2

## 0.2.13-beta.1

### Dependency updates

- @gradio/atoms@0.8.1-beta.1
- @gradio/icons@0.8.0-beta.1
- @gradio/statustracker@0.8.0-beta.1
- @gradio/utils@0.7.0-beta.1

## 0.2.13

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.1
- @gradio/statustracker@0.7.6
- @gradio/atoms@0.8.1
- @gradio/icons@0.7.2

## 0.2.12

### Features

- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.0
- @gradio/atoms@0.8.0
- @gradio/statustracker@0.7.5
- @gradio/icons@0.7.1

## 0.2.11

### Dependency updates

- @gradio/atoms@0.7.9
- @gradio/statustracker@0.7.4
- @gradio/icons@0.7.0

## 0.2.10

### Dependency updates

- @gradio/atoms@0.7.8
- @gradio/icons@0.6.1
- @gradio/utils@0.5.2
- @gradio/statustracker@0.7.3

## 0.2.9

### Dependency updates

- @gradio/statustracker@0.7.2
- @gradio/atoms@0.7.7

## 0.2.8

### Dependency updates

- @gradio/atoms@0.7.6
- @gradio/utils@0.5.1
- @gradio/statustracker@0.7.1
- @gradio/icons@0.6.0

## 0.2.7

### Dependency updates

- @gradio/atoms@0.7.5
- @gradio/utils@0.5.0
- @gradio/icons@0.5.0
- @gradio/statustracker@0.7.0

## 0.2.6

### Dependency updates

- @gradio/statustracker@0.6.0

## 0.2.6

### Dependency updates

- @gradio/statustracker@0.6.0

## 0.2.5

### Dependency updates

- @gradio/utils@0.4.2
- @gradio/atoms@0.7.4
- @gradio/statustracker@0.5.5

## 0.2.4

### Dependency updates

- @gradio/statustracker@0.5.4

## 0.2.3

### Dependency updates

- @gradio/statustracker@0.5.3

## 0.2.2

### Dependency updates

- @gradio/atoms@0.7.3
- @gradio/statustracker@0.5.2
- @gradio/icons@0.4.1

## 0.2.1

### Dependency updates

- @gradio/atoms@0.7.2
- @gradio/utils@0.4.1
- @gradio/statustracker@0.5.1

## 0.2.0

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

## 0.1.15

### Dependency updates

- @gradio/utils@0.3.2
- @gradio/statustracker@0.4.12
- @gradio/atoms@0.7.0
- @gradio/icons@0.4.0

## 0.1.14

### Dependency updates

- @gradio/utils@0.3.1
- @gradio/atoms@0.6.2
- @gradio/statustracker@0.4.11

## 0.1.13

### Dependency updates

- @gradio/atoms@0.6.1
- @gradio/statustracker@0.4.10
- @gradio/icons@0.3.4

## 0.1.12

### Dependency updates

- @gradio/statustracker@0.4.9
- @gradio/atoms@0.6.0

## 0.1.11

### Patch Changes

- Updated dependencies [[`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89)]:
  - @gradio/statustracker@0.4.8

## 0.1.10

### Patch Changes

- Updated dependencies [[`f191786`](https://github.com/gradio-app/gradio/commit/f1917867916647d383b8d7ce15e0c17f2abbdec1)]:
  - @gradio/icons@0.3.3
  - @gradio/atoms@0.5.3
  - @gradio/statustracker@0.4.7

## 0.1.9

### Patch Changes

- Updated dependencies [[`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7)]:
  - @gradio/utils@0.3.0
  - @gradio/atoms@0.5.2
  - @gradio/statustracker@0.4.6

## 0.1.8

### Fixes

- [#7192](https://github.com/gradio-app/gradio/pull/7192) [`8dd6f4b`](https://github.com/gradio-app/gradio/commit/8dd6f4bc1901792f05cd59e86df7b1dbab692739) - Handle the case where examples is `null` for all components. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.7

### Patch Changes

- Updated dependencies [[`5727b92`](https://github.com/gradio-app/gradio/commit/5727b92abc8a00a675bfc0a921b38de771af947b), [`c60ad4d`](https://github.com/gradio-app/gradio/commit/c60ad4d34ab5b56a89bf6796822977e51e7a4a32)]:
  - @gradio/utils@0.2.1
  - @gradio/atoms@0.5.0
  - @gradio/statustracker@0.4.4

## 0.1.6

### Patch Changes

- Updated dependencies [[`828fb9e`](https://github.com/gradio-app/gradio/commit/828fb9e6ce15b6ea08318675a2361117596a1b5d), [`73268ee`](https://github.com/gradio-app/gradio/commit/73268ee2e39f23ebdd1e927cb49b8d79c4b9a144)]:
  - @gradio/statustracker@0.4.3
  - @gradio/atoms@0.4.1

## 0.1.5

### Patch Changes

- Updated dependencies [[`053bec9`](https://github.com/gradio-app/gradio/commit/053bec98be1127e083414024e02cf0bebb0b5142), [`4d1cbbc`](https://github.com/gradio-app/gradio/commit/4d1cbbcf30833ef1de2d2d2710c7492a379a9a00)]:
  - @gradio/icons@0.3.2
  - @gradio/atoms@0.4.0
  - @gradio/statustracker@0.4.2

## 0.1.4

### Patch Changes

- Updated dependencies [[`206af31`](https://github.com/gradio-app/gradio/commit/206af31d7c1a31013364a44e9b40cf8df304ba50)]:
  - @gradio/icons@0.3.1
  - @gradio/atoms@0.3.1
  - @gradio/statustracker@0.4.1

## 0.1.3

### Patch Changes

- Updated dependencies [[`9caddc17b`](https://github.com/gradio-app/gradio/commit/9caddc17b1dea8da1af8ba724c6a5eab04ce0ed8)]:
  - @gradio/atoms@0.3.0
  - @gradio/icons@0.3.0
  - @gradio/statustracker@0.4.0

## 0.1.2

### Patch Changes

- Updated dependencies [[`f816136a0`](https://github.com/gradio-app/gradio/commit/f816136a039fa6011be9c4fb14f573e4050a681a)]:
  - @gradio/atoms@0.2.2
  - @gradio/icons@0.2.1
  - @gradio/statustracker@0.3.2

## 0.1.1

### Patch Changes

- Updated dependencies [[`3cdeabc68`](https://github.com/gradio-app/gradio/commit/3cdeabc6843000310e1a9e1d17190ecbf3bbc780), [`fad92c29d`](https://github.com/gradio-app/gradio/commit/fad92c29dc1f5cd84341aae417c495b33e01245f)]:
  - @gradio/atoms@0.2.1
  - @gradio/statustracker@0.3.1

## 0.1.0

### Patch Changes

- Updated dependencies [[`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7), [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7), [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7)]:
  - @gradio/icons@0.2.0
  - @gradio/utils@0.2.0
  - @gradio/atoms@0.2.0
  - @gradio/statustracker@0.3.0

## 0.1.0-beta.3

### Features

- [#6149](https://github.com/gradio-app/gradio/pull/6149) [`90318b1dd`](https://github.com/gradio-app/gradio/commit/90318b1dd118ae08a695a50e7c556226234ab6dc) - swap `mode` on the frontned to `interactive` to match the backend. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.2

### Features

- [#5996](https://github.com/gradio-app/gradio/pull/5996) [`9cf40f76f`](https://github.com/gradio-app/gradio/commit/9cf40f76fed1c0f84b5a5336a9b0100f8a9b4ee3) - V4: Simple dropdown. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!