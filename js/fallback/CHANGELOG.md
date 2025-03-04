# @gradio/fallback

## 0.4.14

### Dependency updates

- @gradio/statustracker@0.10.4
- @gradio/atoms@0.13.3

## 0.4.13

### Dependency updates

- @gradio/statustracker@0.10.3
- @gradio/atoms@0.13.2
- @gradio/utils@0.10.1

## 0.4.12

### Dependency updates

- @gradio/statustracker@0.10.2

## 0.4.11

### Dependency updates

- @gradio/atoms@0.13.1
- @gradio/statustracker@0.10.1

## 0.4.10

### Dependency updates

- @gradio/atoms@0.13.0
- @gradio/utils@0.10.0
- @gradio/statustracker@0.10.0

## 0.4.9

### Dependency updates

- @gradio/statustracker@0.9.7
- @gradio/atoms@0.12.0

## 0.4.8

### Dependency updates

- @gradio/atoms@0.11.2
- @gradio/utils@0.9.0
- @gradio/statustracker@0.9.6

## 0.4.7

### Dependency updates

- @gradio/atoms@0.11.1
- @gradio/utils@0.8.0
- @gradio/statustracker@0.9.5

## 0.4.6

### Dependency updates

- @gradio/statustracker@0.9.4
- @gradio/atoms@0.11.0

## 0.4.5

### Dependency updates

- @gradio/statustracker@0.9.3
- @gradio/atoms@0.10.1

## 0.4.4

### Dependency updates

- @gradio/statustracker@0.9.2
- @gradio/atoms@0.10.0

## 0.4.3

### Dependency updates

- @gradio/statustracker@0.9.1
- @gradio/atoms@0.9.2

## 0.4.2

### Dependency updates

- @gradio/atoms@0.9.1
- @gradio/statustracker@0.9.0

## 0.4.1

### Dependency updates

- @gradio/statustracker@0.8.1

## 0.3.13-beta.5

### Dependency updates

- @gradio/statustracker@0.8.0-beta.5
- @gradio/atoms@0.9.0-beta.5

## 0.3.13-beta.4

### Dependency updates

- @gradio/statustracker@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.4

## 0.3.13-beta.3

### Dependency updates

- @gradio/statustracker@0.8.0-beta.3
- @gradio/atoms@0.9.0-beta.3

## 0.3.13-beta.2

### Dependency updates

- @gradio/statustracker@0.8.0-beta.2

## 0.3.13-beta.2

### Dependency updates

- @gradio/atoms@0.9.0-beta.2
- @gradio/statustracker@0.8.0-beta.2
- @gradio/utils@0.7.0-beta.2

## 0.3.13-beta.1

### Dependency updates

- @gradio/atoms@0.8.1-beta.1
- @gradio/statustracker@0.8.0-beta.1
- @gradio/utils@0.7.0-beta.1

## 0.3.13

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.1
- @gradio/statustracker@0.7.6
- @gradio/atoms@0.8.1

## 0.3.12

### Features

- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.0
- @gradio/atoms@0.8.0
- @gradio/statustracker@0.7.5

## 0.3.11

### Dependency updates

- @gradio/atoms@0.7.9
- @gradio/statustracker@0.7.4

## 0.3.10

### Dependency updates

- @gradio/atoms@0.7.8
- @gradio/utils@0.5.2
- @gradio/statustracker@0.7.3

## 0.3.9

### Dependency updates

- @gradio/statustracker@0.7.2
- @gradio/atoms@0.7.7

## 0.3.8

### Dependency updates

- @gradio/atoms@0.7.6
- @gradio/utils@0.5.1
- @gradio/statustracker@0.7.1

## 0.3.7

### Dependency updates

- @gradio/atoms@0.7.5
- @gradio/utils@0.5.0
- @gradio/statustracker@0.7.0

## 0.3.6

### Dependency updates

- @gradio/statustracker@0.6.0

## 0.3.6

### Dependency updates

- @gradio/statustracker@0.6.0

## 0.3.5

### Dependency updates

- @gradio/utils@0.4.2
- @gradio/atoms@0.7.4
- @gradio/statustracker@0.5.5

## 0.3.4

### Dependency updates

- @gradio/statustracker@0.5.4

## 0.3.3

### Dependency updates

- @gradio/statustracker@0.5.3

## 0.3.2

### Dependency updates

- @gradio/atoms@0.7.3
- @gradio/statustracker@0.5.2

## 0.3.1

### Dependency updates

- @gradio/atoms@0.7.2
- @gradio/utils@0.4.1
- @gradio/statustracker@0.5.1

## 0.3.0

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

## 0.2.15

### Dependency updates

- @gradio/utils@0.3.2
- @gradio/statustracker@0.4.12
- @gradio/atoms@0.7.0

## 0.2.14

### Dependency updates

- @gradio/utils@0.3.1
- @gradio/atoms@0.6.2
- @gradio/statustracker@0.4.11

## 0.2.13

### Dependency updates

- @gradio/atoms@0.6.1
- @gradio/statustracker@0.4.10

## 0.2.12

### Dependency updates

- @gradio/statustracker@0.4.9
- @gradio/atoms@0.6.0

## 0.2.11

### Patch Changes

- Updated dependencies [[`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89)]:
  - @gradio/statustracker@0.4.8

## 0.2.10

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.5.3
  - @gradio/statustracker@0.4.7

## 0.2.9

### Patch Changes

- Updated dependencies [[`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7)]:
  - @gradio/utils@0.3.0
  - @gradio/atoms@0.5.2
  - @gradio/statustracker@0.4.6

## 0.2.8

### Patch Changes

- Updated dependencies [[`fdd1521`](https://github.com/gradio-app/gradio/commit/fdd15213c24b9cbc58bbc1b6beb4af7c18f48557)]:
  - @gradio/utils@0.2.2
  - @gradio/atoms@0.5.1
  - @gradio/statustracker@0.4.5

## 0.2.7

### Patch Changes

- Updated dependencies [[`5727b92`](https://github.com/gradio-app/gradio/commit/5727b92abc8a00a675bfc0a921b38de771af947b), [`c60ad4d`](https://github.com/gradio-app/gradio/commit/c60ad4d34ab5b56a89bf6796822977e51e7a4a32)]:
  - @gradio/utils@0.2.1
  - @gradio/atoms@0.5.0
  - @gradio/statustracker@0.4.4

## 0.2.6

### Patch Changes

- Updated dependencies [[`828fb9e`](https://github.com/gradio-app/gradio/commit/828fb9e6ce15b6ea08318675a2361117596a1b5d), [`73268ee`](https://github.com/gradio-app/gradio/commit/73268ee2e39f23ebdd1e927cb49b8d79c4b9a144)]:
  - @gradio/statustracker@0.4.3
  - @gradio/atoms@0.4.1

## 0.2.5

### Patch Changes

- Updated dependencies [[`4d1cbbc`](https://github.com/gradio-app/gradio/commit/4d1cbbcf30833ef1de2d2d2710c7492a379a9a00)]:
  - @gradio/atoms@0.4.0
  - @gradio/statustracker@0.4.2

## 0.2.4

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.3.1
  - @gradio/statustracker@0.4.1

## 0.2.3

### Patch Changes

- Updated dependencies [[`9caddc17b`](https://github.com/gradio-app/gradio/commit/9caddc17b1dea8da1af8ba724c6a5eab04ce0ed8)]:
  - @gradio/atoms@0.3.0
  - @gradio/statustracker@0.4.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`f816136a0`](https://github.com/gradio-app/gradio/commit/f816136a039fa6011be9c4fb14f573e4050a681a)]:
  - @gradio/atoms@0.2.2
  - @gradio/statustracker@0.3.2

## 0.2.1

### Patch Changes

- Updated dependencies [[`3cdeabc68`](https://github.com/gradio-app/gradio/commit/3cdeabc6843000310e1a9e1d17190ecbf3bbc780), [`fad92c29d`](https://github.com/gradio-app/gradio/commit/fad92c29dc1f5cd84341aae417c495b33e01245f)]:
  - @gradio/atoms@0.2.1
  - @gradio/statustracker@0.3.1

## 0.2.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.8

### Patch Changes

- Updated dependencies [[`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a), [`c476bd5a5`](https://github.com/gradio-app/gradio/commit/c476bd5a5b70836163b9c69bf4bfe068b17fbe13)]:
  - @gradio/atoms@0.2.0-beta.6
  - @gradio/statustracker@0.3.0-beta.8
  - @gradio/utils@0.2.0-beta.6

## 0.2.0-beta.7

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6107](https://github.com/gradio-app/gradio/pull/6107) [`9a40de7bf`](https://github.com/gradio-app/gradio/commit/9a40de7bff5844c8a135e73c7d175eb02b63a966) - Fix: Move to cache in init postprocess + Fallback Fixes. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6092](https://github.com/gradio-app/gradio/pull/6092) [`11d67ae75`](https://github.com/gradio-app/gradio/commit/11d67ae7529e0838565e4131b185c413489c5aa6) - Add a stand-alone install command and tidy-up the fallback template. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.2.0-beta.6

### Features

- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files. Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.5

### Features

- [#5648](https://github.com/gradio-app/gradio/pull/5648) [`c573e2339`](https://github.com/gradio-app/gradio/commit/c573e2339b86c85b378dc349de5e9223a3c3b04a) - Publish all components to npm. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.2.0-beta.4

### Patch Changes

- Updated dependencies [[`0b4fd5b6d`](https://github.com/gradio-app/gradio/commit/0b4fd5b6db96fc95a155e5e935e17e1ab11d1161)]:
  - @gradio/utils@0.2.0-beta.3
  - @gradio/atoms@0.2.0-beta.3
  - @gradio/statustracker@0.3.0-beta.4

## 0.2.0-beta.3

### Patch Changes

- Updated dependencies [[`14fc612d8`](https://github.com/gradio-app/gradio/commit/14fc612d84bf6b1408eccd3a40fab41f25477571)]:
  - @gradio/utils@0.2.0-beta.2
  - @gradio/atoms@0.2.0-beta.2
  - @gradio/statustracker@0.3.0-beta.3

## 0.2.0-beta.2

### Features

- [#5620](https://github.com/gradio-app/gradio/pull/5620) [`c4c25ecdf`](https://github.com/gradio-app/gradio/commit/c4c25ecdf8c2fab5e3c41b519564e3b6a9ebfce3) - fix build and broken imports. Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.1

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.2.0-beta.1
  - @gradio/atoms@0.2.0-beta.1
  - @gradio/statustracker@0.3.0-beta.1

## 0.2.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

# @gradio/checkbox

## 0.1.1

### Fixes

- [#5340](https://github.com/gradio-app/gradio/pull/5340) [`df090e89`](https://github.com/gradio-app/gradio/commit/df090e89f74a16e4cb2b700a1e3263cabd2bdd91) - Fix Checkbox select dispatch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

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