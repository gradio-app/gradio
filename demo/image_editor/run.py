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
            fixed_canvas=True,
            canvas_size=[400, 400],
            type="numpy",
        )
        im_preview = gr.Image()
    n_upload = gr.Number(0, label="Number of upload events", step=1)
    n_change = gr.Number(0, label="Number of change events", step=1)
    n_input = gr.Number(0, label="Number of input events", step=1)

    im.upload(lambda x: x + 1, outputs=n_upload, inputs=n_upload)
    im.change(lambda x: x + 1, outputs=n_change, inputs=n_change)
    im.input(lambda x: x + 1, outputs=n_input, inputs=n_input)
    im.change(predict, outputs=im_preview, inputs=im, show_progress="hidden")
    im.apply(predict, outputs=im_preview, inputs=im, show_progress="hidden")

if __name__ == "__main__":
    demo.launch()
