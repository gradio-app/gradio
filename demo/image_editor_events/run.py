import gradio as gr
import time


def sleep(im):
    time.sleep(5)
    return [im["background"], im["layers"][0], im["layers"][1], im["composite"]]


def predict(im):
    # print(im)
    return im["composite"]


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

if __name__ == "__main__":
    demo.launch()
