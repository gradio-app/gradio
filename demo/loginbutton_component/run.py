import gradio as gr

with gr.Blocks() as demo:
    gr.LoginButton(redirect_url="https://gradio-chat-gradio-app-hfips.hf.space/")

demo.launch()
