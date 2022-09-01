# URL: https://huggingface.co/spaces/gradio/autocomplete
import gradio as gr

# load a model from https://hf.co/models as an interface, then use it as an api 
api = gr.Interface.load("huggingface/EleutherAI/gpt-j-6B")

# define the core function
def complete_with_gpt(text):
    # Use the last 50 characters of the text as context
    return text[:-50] + api(text[-50:])

# start a block
with gr.Blocks() as demo:
    # define the UI: one textbox, and a button
    textbox = gr.Textbox(placeholder="Type here...", lines=4)
    btn = gr.Button("Autocomplete")
    
    # define what will run when the button is clicked
    # the textbox is used as both an input and an output
    btn.click(fn=complete_with_gpt, inputs=textbox, outputs=textbox)

# launch    
demo.launch()