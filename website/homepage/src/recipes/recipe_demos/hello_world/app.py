# URL: https://huggingface.co/spaces/gradio/hello_world
import gradio as gr

# defining the core function
def greet(name):
    return "Hello " + name + "!"

# defining a text-to-text interface 
demo = gr.Interface(fn=greet, inputs="text", outputs="text")
    
# launching the interface 
demo.launch()   