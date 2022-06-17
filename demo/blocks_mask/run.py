import gradio as gr


def fn(mask):
    return [mask["image"], mask["mask"]]


demo = gr.Blocks()

with demo:
    img = gr.Image(tool="sketch", source="upload", label="Mask")
    btn = gr.Button("Run")
    img2 = gr.Image()
    img3 = gr.Image()

    btn.click(fn=fn, inputs=img, outputs=[img2, img3])


demo.launch()
