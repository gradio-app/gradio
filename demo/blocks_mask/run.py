import gradio as gr
from gradio.components import Markdown as md

demo = gr.Blocks()

io1a = gr.Interface(lambda x: x, gr.Image(), gr.Image())
io1b = gr.Interface(lambda x: x, gr.Image(source="webcam"), gr.Image())

io2a = gr.Interface(lambda x: x, gr.Image(source="canvas"), gr.Image())
io2b = gr.Interface(lambda x: x, gr.Sketchpad(), gr.Image())

io3a = gr.Interface(
    lambda x: x["image"], gr.Image(source="canvas", tool="color-sketch"), gr.Image()
)
io3b = gr.Interface(
    lambda x: x["image"], gr.Image(source="upload", tool="color-sketch"), gr.Image()
)
io4a = gr.Interface(
    lambda x: [x["mask"], x["image"]],
    gr.Image(source="upload", tool="sketch"),
    [gr.Image(), gr.Image()],
)

with demo:
    md("# Different Ways to Use the Image Input Component")
    md("**1a. Standalone Image Upload**")
    io1a.render()
    md("**1b. Standalone Image from Webcam**")
    io1b.render()
    md("**2a. Black and White Sketchpad**")
    io2a.render()
    md("**2b. Black and White Sketchpad using gr.Sketchpad()**")
    io2b.render()
    md("**3a. Color Sketchpad**")
    io3a.render()
    md("**3b. Color Sketchpad with image upload**")
    io3b.render()
    md("**4a. Mask with image upload**")
    io4a.render()


if __name__ == "__main__":
    demo.launch()
