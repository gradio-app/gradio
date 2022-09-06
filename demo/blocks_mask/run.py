import gradio as gr
import os


def fn(mask):
    print(mask)
    return [mask, mask]


demo = gr.Blocks()

with demo:
    with gr.Row():
        with gr.Column():
            img = gr.Image(
                tool="color-sketch",
                source="upload",
                label="Mask",
                value=os.path.join(os.path.dirname(__file__), "lion.jpg"),
            )
            with gr.Row():
                btn = gr.Button("Run")
        with gr.Column():
            img2 = gr.Image()
            img3 = gr.Image()

    btn.click(fn=fn, inputs=img, outputs=[img2, img3])


if __name__ == "__main__":
    demo.launch()
