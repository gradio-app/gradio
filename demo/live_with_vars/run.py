import gradio as gr

gr.Interface(
    lambda x, y: (x + y if y is not None else x, x + y if y is not None else x), 
    ["textbox", "state"], 
    ["textbox", "state"], live=True).launch()
