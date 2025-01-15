# @self/storybook

## 0.8.0

### Features

- [#9794](https://github.com/gradio-app/gradio/pull/9794) [`70bda3b`](https://github.com/gradio-app/gradio/commit/70bda3bb187a7219f4707344cf47edd0a021da19) - fix storybook build.  Thanks @pngwn!

## 0.7.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - 🔡 Update default core Gradio font

## 0.7.0-beta.1

### Features

- [#9204](https://github.com/gradio-app/gradio/pull/9204) [`3c73f00`](https://github.com/gradio-app/gradio/commit/3c73f00e3016b16917ebfe0bad390f2dff683457) - 🔡 Update default core Gradio font.  Thanks @hannahblair!

## 0.6.2

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

## 0.6.1

### Features

- [#9102](https://github.com/gradio-app/gradio/pull/9102) [`efdc323`](https://github.com/gradio-app/gradio/commit/efdc3231a7bde38cfe45d10086d0d36a24c1b9b4) - Initial SSR refactor.  Thanks @pngwn!

### Fixes

- [#9116](https://github.com/gradio-app/gradio/pull/9116) [`ba6322e`](https://github.com/gradio-app/gradio/commit/ba6322ec2bb975f15389fe0700816bf671c6819d) - Fix image height content fit.  Thanks @hannahblair!

## 0.6.0

### Features

- [#8131](https://github.com/gradio-app/gradio/pull/8131) [`bb504b4`](https://github.com/gradio-app/gradio/commit/bb504b494947a287d6386e0e7ead3860c0f15223) - Gradio components in `gr.Chatbot()`.  Thanks @dawoodkhan82!

## 0.5.0

### Features

- [#8121](https://github.com/gradio-app/gradio/pull/8121) [`f5b710c`](https://github.com/gradio-app/gradio/commit/f5b710c919b0ce604ea955f0d5f4faa91095ca4a) - chore(deps): update dependency eslint to v9.  Thanks @renovate!
- [#8209](https://github.com/gradio-app/gradio/pull/8209) [`b9afe93`](https://github.com/gradio-app/gradio/commit/b9afe93915401df5bd6737c89395c2477acfa585) - Rename `eventSource_Factory` and `fetch_implementation`.  Thanks @hannahblair!

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

## 0.3.1

### Features

- [#7743](https://github.com/gradio-app/gradio/pull/7743) [`a2badf1`](https://github.com/gradio-app/gradio/commit/a2badf151e3f4b1b5ac80621ee189870a71893c5) - Migrate to Storybook 8.  Thanks @hannahblair!

## 0.3.0

### Features

- [#7222](https://github.com/gradio-app/gradio/pull/7222) [`5181957`](https://github.com/gradio-app/gradio/commit/51819577068addde8fab1f4d4cfe691f20396f3f) - Add mobile Chromatic tests.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.2.0

### Features

- [#6451](https://github.com/gradio-app/gradio/pull/6451) [`d92de491b`](https://github.com/gradio-app/gradio/commit/d92de491bf2fbdbbb57fe5bc23165c4933afe182) - Optimise Chromatic workflow.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.1.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Improve Audio Component.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.0

### Features

- [#5966](https://github.com/gradio-app/gradio/pull/5966) [`9cad2127b`](https://github.com/gradio-app/gradio/commit/9cad2127b965023687470b3abfe620e188a9da6e) - Improve Audio Component.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6089](https://github.com/gradio-app/gradio/pull/6089) [`cd8146ba0`](https://github.com/gradio-app/gradio/commit/cd8146ba053fbcb56cf5052e658e4570d457fb8a) - Update logos for v4.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#6065](https://github.com/gradio-app/gradio/pull/6065) [`7d07001e8`](https://github.com/gradio-app/gradio/commit/7d07001e8e7ca9cbd2251632667b3a043de49f49) - fix storybook.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests.  Thanks [@pngwn](https://github.com/pngwn)!