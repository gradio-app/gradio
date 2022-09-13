import gradio as gr
from gradio.components import Markdown as md

demo = gr.Blocks()

io1a = gr.Interface(lambda x: x, gr.Image(), gr.Image())
io1b = gr.Interface(lambda x: x, gr.Image(source="webcam"), gr.Image())

io2a = gr.Interface(lambda x: x, gr.Image(source="canvas"), gr.Image())
io2b = gr.Interface(lambda x: x, gr.Sketchpad(), gr.Image())

with demo:
    md("# Different Ways to Use the Image Input Component")
    md("**1a. Standalone Image Upload**")
    # io1a.render()
    md("**1b. Standalone Image from Webcam**")
    # io1b.render()
    md("**2a. Black and White Sketchpad**")
    io2a.render()
    md("**2a. Black and White Sketchpad using gr.Sketchpad()**")
#     io2b.render()

if __name__ == "__main__":
    demo.launch()
