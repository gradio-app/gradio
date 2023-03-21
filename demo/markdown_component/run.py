import gradio as gr

css = (
    "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"
)

with gr.Blocks(css=css) as demo:
    gr.Markdown(value="This _example_ was **written** in [Markdown](https://en.wikipedia.org/wiki/Markdown)\n")

demo.launch()
