# import gradio as gr

# css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

# with gr.Blocks(css=css) as demo:
#     gr.Audio()

# demo.launch()


import gradio as gr

code = """```python
def greet(x):
    return "hello, " + x
```
"""

message = [(
    "write a python program",
    code
)]

with gr.Blocks() as demo:
    gr.Chatbot(message)
    
demo.launch()