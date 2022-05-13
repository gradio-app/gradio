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
    with gr.Row():
            text1 = gr.component("textarea")
            text2 = gr.TextArea()
            text3 = gr.templates.TextArea()
    text1.change(greet, text1, text2)
    text2.change(greet, text2, text3)
    text3.change(greet, text3, text1)
    demo.launch()
