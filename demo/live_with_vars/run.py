import gradio as gr

gr.Interface(
    lambda x, y: (x, y), 
    ["textbox", "state"], 
    ["textbox", "state"], live=True).launch()

# gr.Interface(
#     lambda x: x, 
#     ["textbox"], 
#     ["textbox"], live=True).launch()
