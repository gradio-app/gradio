# URL: https://huggingface.co/spaces/gradio/autocomplete
# DESCRIPTION: This text generation demo works like autocomplete. There's only one textbox and it's used for both the input and the output. The demo loads the model as an interface, and uses that interface as an API. It then uses blocks to create the UI. All of this is done in less than 10 lines of code.
# imports
import gradio as gr
import os

# save your HF API token from https:/hf.co/settings/tokens as an env variable to avoid rate limiting
auth_token = os.getenv("auth_token")

# load a model from https://hf.co/models as an interface, then use it as an api 
# you can remove the api_key parameter if you don't care about rate limiting. 
api = gr.Interface.load("huggingface/EleutherAI/gpt-j-6B", api_key=auth_token)

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
    btn.click(fn=complete_with_gpt, inputs=textbox, outputs=textbox, queue=False)

# launch    
demo.launch()