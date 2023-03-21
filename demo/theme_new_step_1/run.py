import gradio as gr
from gradio.themes.base import Base
import time

class Seafoam(Base):
    pass

seafoam = Seafoam()

def repeat(name, count):
    time.sleep(3)
    return name * count

demo = gr.Interface(
    fn=repeat,
    inputs=[gr.Textbox(), gr.Slider(label="Count")],
    outputs=gr.Textbox(label="Output"),
    theme=seafoam,
)

if __name__ == "__main__":
    demo.launch()