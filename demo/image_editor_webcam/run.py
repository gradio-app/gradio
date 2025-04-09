import gradio as gr


def predict(im):
    return im["composite"]


with gr.Blocks() as demo:
    with gr.Row():
        im = gr.ImageEditor(
            canvas_size=(1024, 1024),
            fixed_canvas=True,
            webcam_options={"constraints": {"video": {"width": 1024, "height": 1024}}},
        )
        im_preview = gr.Image()
    im.change(predict, outputs=im_preview, inputs=im, show_progress="hidden")

if __name__ == "__main__":
    demo.launch()
