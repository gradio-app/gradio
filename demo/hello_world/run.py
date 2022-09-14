# URL: https://huggingface.co/spaces/gradio/hello_world
# DESCRIPTION: The simplest possible Gradio demo. It wraps a 'Hello {name}!' function in an Interface that accepts and returns text.
import gradio as gr

# defining the core function
def greet(name):
    return "Hello " + name + "!"

# defining a text-to-text interface 
demo = gr.Interface(fn=greet, inputs="text", outputs="text")
    
# launching the interface 
demo.launch()   