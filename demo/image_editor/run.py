import gradio as gr
import time


def sleep(im):
    time.sleep(5)
    return [im["background"], im["layers"][0], im["layers"][1], im["composite"]]


with gr.Blocks() as demo:
    im = gr.ImageEditor(
        type="pil",
        crop_size="1:1",
        eraser=gr.Eraser()
    )

    with gr.Group():
        with gr.Row():
            im_out_1 = gr.Image(type="pil")
            im_out_2 = gr.Image(type="pil")
            im_out_3 = gr.Image(type="pil")
            im_out_4 = gr.Image(type="pil")

    btn = gr.Button()
    im.change(sleep, outputs=[im_out_1, im_out_2, im_out_3, im_out_4], inputs=im)

if __name__ == "__main__":
    demo.launch()
