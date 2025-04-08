import gradio as gr
import numpy as np


def predict(im):
    return im["composite"]


def verify_clear(im):
    print(im)
    return int(not np.any(im["composite"])), im["composite"]


with gr.Blocks() as demo:
    with gr.Group():
        with gr.Row():
            im = gr.ImageEditor(
                type="numpy",
                crop_size="1:1",
                elem_id="image_editor",
            )
            im_preview = gr.Image()
    with gr.Group():
        with gr.Row():

            n_upload = gr.Label(
                0,
                label="upload",
                elem_id="upload",
            )
            n_change = gr.Label(
                0,
                label="change",
                elem_id="change",
            )
            n_input = gr.Label(
                0,
                label="input",
                elem_id="input",
            )
            n_apply = gr.Label(
                0,
                label="apply",
                elem_id="apply",
            )
            cleared_properly = gr.Number(label="cleared properly")
    clear_btn = gr.Button("Clear Button", elem_id="clear")

    im.upload(
        lambda x: int(x) + 1, outputs=n_upload, inputs=n_upload, show_progress="hidden"
    )
    im.change(
        lambda x: int(x) + 1, outputs=n_change, inputs=n_change, show_progress="hidden"
    )
    im.input(
        lambda x: int(x) + 1, outputs=n_input, inputs=n_input, show_progress="hidden"
    )
    im.apply(
        lambda x: int(x) + 1, outputs=n_apply, inputs=n_apply, show_progress="hidden"
    )
    im.change(predict, outputs=im_preview, inputs=im, show_progress="hidden")
    clear_btn.click(
        lambda: None,
        None,
        im,
    ).then(verify_clear, inputs=im, outputs=[cleared_properly, im])

if __name__ == "__main__":
    demo.launch()
