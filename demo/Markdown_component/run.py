import gradio as gr
with gr.Blocks() as demo:
    component = gr.Markdown(value="This _example_ was **written** in [Markdown](https://en.wikipedia.org/wiki/Markdown)\n")
demo.launch()