---
"@gradio/annotatedimage": patch
"@gradio/app": patch
"@gradio/atoms": patch
"@gradio/audio": patch
"@gradio/button": patch
"@gradio/chatbot": patch
"@gradio/checkbox": patch
"@gradio/checkboxgroup": patch
"@gradio/code": patch
"@gradio/colorpicker": patch
"@gradio/dataframe": patch
"@gradio/dropdown": patch
"@gradio/file": patch
"@gradio/gallery": patch
"@gradio/highlightedtext": patch
"@gradio/html": patch
"@gradio/image": patch
"@gradio/json": patch
"@gradio/label": patch
"@gradio/markdown": patch
"@gradio/model3d": patch
"@gradio/number": patch
"@gradio/plot": patch
"@gradio/radio": patch
"@gradio/slider": patch
"@gradio/tabitem": patch
"@gradio/tabs": patch
"@gradio/textbox": patch
"@gradio/theme": patch
"@gradio/timeseries": patch
"@gradio/tootils": patch
"@gradio/upload": patch
"@gradio/uploadbutton": patch
"@gradio/utils": patch
"@gradio/video": patch
"gradio": patch
"website": patch
---

highlight:

#### Improve startup performance and markdown support

#### Improved markdown support

We now have better support for markdown in `gr.Markdown` and `gr.Dataframe`. Including syntax highlighting and Github Flavoured Markdown. We also have more consistent markdown behaviour and styling.

##### Various performance improvements

These improvements will be particularly beneficial to large applications.

- Rather than attaching events manually, they are now delegated, leading to a significant performance improvement and addressing a performance regression introduced in a recent version of Gradio. App startup for large applications is now around twice as fast.
- Optimised the mounting of individual components, leading to a modest performance improvement during startup (~30%).
- Corrected an issue that was causing markdown to re-render infinitely.
- Ensured that the `gr.3DModel` does re-render prematurely.
