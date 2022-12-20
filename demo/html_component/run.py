import gradio as gr 

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

with gr.Blocks(css=css) as demo:
    gr.HTML(value="<p style='margin-top: 1rem, margin-bottom: 1rem'>Gradio Docs Readers: <img src='https://visitor-badge.glitch.me/badge?page_id=gradio-docs-visitor-badge' alt='visitor badge' style='display: inline-block'/></p>")

demo.launch()