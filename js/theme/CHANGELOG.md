# @gradio/theme

## 0.3.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - 🔡 Update default core Gradio font

## 0.3.0-beta.1

### Features

- [#9204](https://github.com/gradio-app/gradio/pull/9204) [`3c73f00`](https://github.com/gradio-app/gradio/commit/3c73f00e3016b16917ebfe0bad390f2dff683457) - 🔡 Update default core Gradio font.  Thanks @hannahblair!

## 0.2.5

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

## 0.2.4

### Features

- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!

## 0.2.3

### Features

- [#8311](https://github.com/gradio-app/gradio/pull/8311) [`35905c5`](https://github.com/gradio-app/gradio/commit/35905c5c8f7acbe669486ac8f57b6955328e4783) - Cleanup markdown styling.  Thanks @aliabid94!

## 0.2.2

### Features

- [#7998](https://github.com/gradio-app/gradio/pull/7998) [`06bdf0e`](https://github.com/gradio-app/gradio/commit/06bdf0eddf59bf79b6b4d1268fc9290955ef2490) - Restore chatbot formatting.  Thanks @aliabid94!

## 0.2.1

### Features

- [#7936](https://github.com/gradio-app/gradio/pull/7936) [`b165193`](https://github.com/gradio-app/gradio/commit/b165193902985b77a732ed703423ebebeaf0da27) - Restore Markdown formatting for Chatbots, MarkdownCode.  Thanks @aliabid94!

## 0.2.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0-beta.2

### Features

- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.2.0

### Highlights

#### new `FileExplorer` component ([#5672](https://github.com/gradio-app/gradio/pull/5672) [`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e))

Thanks to a new capability that allows components to communicate directly with the server _without_ passing data via the value, we have created a new `FileExplorer` component.

This component allows you to populate the explorer by passing a glob, but only provides the selected file(s) in your prediction function. 

Users can then navigate the virtual filesystem and select files which will be accessible in your predict function. This component will allow developers to build more complex spaces, with more flexible input options.

![output](https://github.com/pngwn/MDsveX/assets/12937446/ef108f0b-0e84-4292-9984-9dc66b3e144d)

For more information check the [`FileExplorer` documentation](https://gradio.app/docs/fileexplorer).

 Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.1.0

### Features

- [#5342](https://github.com/gradio-app/gradio/pull/5342) [`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912) - significantly improve the performance of `gr.Dataframe` for large datasets.  Thanks [@pngwn](https://github.com/pngwn)!

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

### Fixes

- [#4997](https://github.com/gradio-app/gradio/pull/4997) [`41c83070`](https://github.com/gradio-app/gradio/commit/41c83070b01632084e7d29123048a96c1e261407) - Add CSS resets and specifiers to play nice with HF blog. Thanks [@aliabid94](https://github.com/aliabid94)!