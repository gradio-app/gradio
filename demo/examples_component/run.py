import gradio as gr
# get_image() returns the file path to sample images included with Gradio
from gradio.media import get_image

def flip(i):
    return i.rotate(180)

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            img_i = gr.Image(label="Input Image", type="pil")
        with gr.Column():
            img_o = gr.Image(label="Output Image")
    with gr.Row():
        btn = gr.Button(value="Flip Image")
    btn.click(flip, inputs=[img_i], outputs=[img_o])

    gr.Examples(
        [
            get_image("cheetah1"),
            get_image("lion"),
        ],
        img_i,
        img_o,
        flip,
    )

demo.launch()
