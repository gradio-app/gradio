import gradio as gr
from pathlib import Path

base_root = Path(__file__).parent.resolve()

with gr.Blocks() as demo:
    dd = gr.Dropdown(label="Select File Explorer Root",
                     value=str(base_root / "dir1"),
                     choices=[str(base_root / "dir1"), str(base_root / "dir2")])
    fe = gr.FileExplorer(root=str(base_root / "dir1"), interactive=True)
    dd.select(lambda s: gr.FileExplorer(root=s), inputs=[dd], outputs=[fe])


if __name__ == "__main__":
    demo.launch()