---
"@gradio/app": minor
"@gradio/audio": minor
"@gradio/chatbot": minor
"@gradio/checkbox": minor
"@gradio/checkboxgroup": minor
"@gradio/client": minor
"@gradio/code": minor
"@gradio/colorpicker": minor
"@gradio/dataframe": minor
"@gradio/dropdown": minor
"@gradio/fallback": minor
"@gradio/file": minor
"@gradio/fileexplorer": minor
"@gradio/gallery": minor
"@gradio/highlightedtext": minor
"@gradio/html": minor
"@gradio/image": minor
"@gradio/imageeditor": minor
"@gradio/json": minor
"@gradio/label": minor
"@gradio/markdown": minor
"@gradio/model3d": minor
"@gradio/multimodaltextbox": minor
"@gradio/number": minor
"@gradio/plot": minor
"@gradio/radio": minor
"@gradio/simpledropdown": minor
"@gradio/simpleimage": minor
"@gradio/simpletextbox": minor
"@gradio/slider": minor
"@gradio/statustracker": minor
"@gradio/storybook": minor
"@gradio/textbox": minor
"@gradio/tootils": minor
"@gradio/upload": minor
"@gradio/uploadbutton": minor
"@gradio/utils": minor
"@gradio/video": minor
"gradio": minor
"gradio_client": minor
---

highlight:

#### Setting File Upload Limits

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