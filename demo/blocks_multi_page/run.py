import gradio as gr

with gr.Blocks() as demo:
    with gr.Page("About", route="/about"):
        gr.Markdown("# About Us")
        gr.Textbox("This is page two")

    with gr.Page("Contact", route="/contact"):
        gr.Markdown("# Contact Us")
        with gr.Row():
            gr.Textbox("Name")
            gr.Textbox("Email")

demo.launch()
