import gradio as gr


def greet(video):
    return video


with gr.Blocks() as demo:
    """
    You can make use of str shortcuts you use in Interface within Blocks as well.
    1. You can use gr.component() or
    2. gr.templates.Template() or gr.Template()
    All the templates are listed in gradio/templates.py
    """
    with gr.Column():
        input = gr.component("textarea")
    with gr.Column():
        output = gr.TextArea()
        output2 = gr.templates.TextArea()
    input.change(greet, input, output)
    demo.launch()
