import gradio as gr
from gradio_pdf import PDF


demo = gr.Interface(lambda x: x,
                    PDF(),
                    gr.File())

if __name__ == "__main__":
    demo.launch()