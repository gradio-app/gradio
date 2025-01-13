import gradio as gr

with gr.Blocks() as demo:
    with gr.Page("About", route="/about"):
        gr.Markdown("# About Us")
        gr.Textbox("About Us")
demo.launch()
