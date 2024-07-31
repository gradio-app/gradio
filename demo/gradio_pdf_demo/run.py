import gradio as gr
from gradio_pdf import PDF
from pathlib import Path

current_dir = Path(__file__).parent

demo = gr.Interface(lambda x: x,
                    PDF(),
                    gr.File(),
                    examples=[[str(current_dir / "contract.pdf")]])

if __name__ == "__main__":
    demo.launch()
