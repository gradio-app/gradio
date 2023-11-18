import gradio as gr
import time


def sleep(im):
    time.sleep(5)
    return im


with gr.Blocks() as demo:
    im = gr.ImageEditor(
        type="pil",
        crop_size="1:1",
        interactive=True,
        brush=None,
        eraser=None,
    )

    im_out = gr.ImageEditor(
        type="pil",
        interactive=True,
        crop_size="1:1",
    )

    btn = gr.Button()
    im.change(sleep, outputs=im_out, inputs=im)

if __name__ == "__main__":
    demo.launch()
