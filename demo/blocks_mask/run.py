import gradio as gr


def fn(mask):
    return [mask["image"], mask["mask"]]


demo = gr.Blocks()

with demo:
    with gr.Row():
        with gr.Column():
            img = gr.Image(tool="sketch", source="webcam", label="Mask")
            btn = gr.Button("Run")
        with gr.Column():
            img2 = gr.Image()
            img3 = gr.Image()

    btn.click(fn=fn, inputs=img, outputs=[img2, img3])


demo.launch()
