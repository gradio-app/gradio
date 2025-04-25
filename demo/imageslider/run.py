import gradio as gr
from PIL import ImageFilter


def img_to_slider(im):
    if not im:
        return im
    return (im, im.filter(filter=ImageFilter.GaussianBlur(radius=10)))


def slider_to_self(im):
    if not im or not im[0]:
        return im
    return (im[0], im[0].filter(filter=ImageFilter.GaussianBlur(radius=10)))


def slider_to_self_two(im):
    return im


def position_to_slider(pos):
    return gr.ImageSlider(slider_position=pos)


with gr.Blocks() as demo:
    gr.Markdown("## img to image slider")
    with gr.Row():
        img1 = gr.Image(label="Blur image", type="pil")
        img2 = gr.ImageSlider(label="Blur image", type="pil")
    btn = gr.Button("Blur image")
    btn.click(img_to_slider, inputs=img1, outputs=img2)
    gr.Markdown("## unified image slider")
    with gr.Row():
        img3 = gr.ImageSlider(label="Blur image", type="pil")
        img3.upload(slider_to_self, inputs=img3, outputs=img3)
    pos = gr.Slider(label="Position", value=50, minimum=0, maximum=100, step=0.01)
    pos.change(position_to_slider, inputs=pos, outputs=img3, show_progress="hidden")

if __name__ == "__main__":
    demo.launch()
