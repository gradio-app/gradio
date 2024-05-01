import gradio as gr


def predict(im):
    return im["composite"]

def get_image_size(im):
    return f"{im['original'].shape[0]} x {im['original'].shape[1]}"


with gr.Blocks() as demo:
    with gr.Group():
        with gr.Row():
            im = gr.ImageEditor(
                canvas_size=[500, 500],
                crop_size=[200, 200],
            )
            im_preview = gr.Image()
        txt = gr.Textbox(label="image size")
        im.change(predict, outputs=im_preview, inputs=im, show_progress="hidden")
        im.change(get_image_size, inputs=im, outputs=txt)


if __name__ == "__main__":
    demo.launch()
