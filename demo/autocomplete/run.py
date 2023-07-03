import gradio as gr
import os

# save your HF API token from https:/hf.co/settings/tokens as an env variable to avoid rate limiting
auth_token = os.getenv("auth_token")

# load a model from https://hf.co/models as an interface, then use it as an api 
# you can remove the api_key parameter if you don't care about rate limiting. 
api = gr.load("huggingface/gpt2-xl", hf_token=auth_token)

def complete_with_gpt(text):
    return text[:-50] + api(text[-50:])

with gr.Blocks() as demo:
    textbox = gr.Textbox(placeholder="Type here...", lines=4)
    btn = gr.Button("Autocomplete")
    
    # define what will run when the button is clicked, here the textbox is used as both an input and an output
    btn.click(fn=complete_with_gpt, inputs=textbox, outputs=textbox, queue=False)

demo.launch()