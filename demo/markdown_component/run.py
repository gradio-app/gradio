import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown(
        value="This _example_ was **written** in [Markdown](https://en.wikipedia.org/wiki/Markdown)\n <a onclick='stoof' href='https://en.wikipedia.org/wiki/Markdown'>Markdown</a>"
    )

demo.launch()
