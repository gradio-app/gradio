import gradio as gr
with gr.Blocks() as demo:
    component = gr.HTML(value="<p style='margin-top: 1rem, margin-bottom: 1rem'>Gradio Docs Readers: <img src='https://visitor-badge.glitch.me/badge?page_id=gradio-docs-visitor-badge' alt='visitor badge' style='display: inline-block'/></p>")
demo.launch()