import gradio as gr
import time


def sleep(im):
    time.sleep(5)
    return [im["background"], im["layers"][0], im["layers"][1], im["composite"]]


with gr.Blocks() as demo:
    im = gr.ImageEditor(
        type="pil",
        crop_size="1:1",
        live=True,
    )
    n_upload = gr.Number(0, label="Number of upload events", step=1)
    n_change = gr.Number(0, label="Number of change events", step=1)

    im.upload(lambda x: x + 1, outputs=n_upload, inputs=n_upload)
    im.change(lambda x: x + 1, outputs=n_change, inputs=n_change)

if __name__ == "__main__":
    demo.launch()
