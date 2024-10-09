import gradio as gr

with gr.Blocks(css=".copy-btn { position: relative; top: -35px; left: 220px; }") as demo:
    gr.Textbox("Rendered Template", label="Chat Prompt", show_copy_button=True, elem_classes="copy-btn")

if __name__ == "__main__":
    demo.launch()
