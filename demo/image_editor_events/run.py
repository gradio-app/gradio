import gradio as gr
import time


def sleep(im):
    time.sleep(5)
    return [im["background"], im["layers"][0], im["layers"][1], im["composite"]]


def predict(im):
    return im["composite"]


with gr.Blocks() as demo:
    with gr.Row():
        im = gr.ImageEditor(
            type="numpy",
            crop_size="1:1",
            live=True,
        )
        im_preview = gr.Image()
    # n_upload = gr.Number(0, label="Number of upload events", step=1)
    # n_change = gr.Number(0, label="Number of change events", step=1)

    # im.upload(lambda x: x + 1, outputs=n_upload, inputs=n_upload)
    im.change(predict, outputs=im_preview, inputs=im, show_progress="hidden")

if __name__ == "__main__":
    demo.launch()
