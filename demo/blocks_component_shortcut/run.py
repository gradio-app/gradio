import gradio as gr


def greet(str):
    return str


with gr.Blocks() as demo:
    """
    You can make use of str shortcuts you use in Interface within Blocks as well.
    
    Interface shortcut example:
    Interface(greet, "textarea", "textarea")
    
    You can use 
    1. gr.component()
    2. gr.templates.Template()
    3. gr.Template()
    All the templates are listed in gradio/templates.py
    """
    with gr.Row():
            text1 = gr.component("textarea")
            text2 = gr.TextArea()
            text3 = gr.templates.TextArea()
    text1.blur(greet, text1, text2)
    text2.blur(greet, text2, text3)
    text3.blur(greet, text3, text1)
    button = gr.component("button")

if __name__ == "__main__":
    demo.launch()
