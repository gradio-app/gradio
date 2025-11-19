# This demo needs to be run from the repo folder.
# python demo/fake_gan/run.py
import time
import gradio as gr
from gradio.media import get_image

def fake_gan():
    time.sleep(5)
    images = [
        (get_image("cheetah.jpg"), f"label {i}")
        for i in range(3)
    ]
    return images, "Done"

with gr.Blocks() as demo:
    gallery = gr.Gallery(
        label="Generated images", show_label=False, elem_id="gallery"
    , columns=1, object_fit="contain", height="auto")
    t = gr.Textbox(label="Progress", elem_id="progress_textbox")
    btn = gr.Button("Generate images", scale=0)

    btn.click(fake_gan, None, [gallery, t], show_progress="minimal", show_progress_on=t)

if __name__ == "__main__":
    demo.launch()
