import gradio as gr

with gr.Blocks() as demo:
    gr.FileExplorer(glob="*.txt", root_dir=".", height=None, max_height=300)

demo.launch()
