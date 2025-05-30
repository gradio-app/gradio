import gradio as gr

with gr.Blocks() as demo:
    with gr.Sidebar(label="Errors (2)", open=True, width=300, show_label=True):
        gr.Markdown("## Sidebar")
        gr.Textbox(label="Input", placeholder="Type something here...")
        gr.Button("Submit")

demo.launch()
