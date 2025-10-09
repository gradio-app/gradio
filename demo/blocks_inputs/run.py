import gradio as gr
import os

def combine(a, b):
    return a + " " + b

def mirror(x):
    return x

with gr.Blocks() as demo:

    txt = gr.Textbox(label="Input", lines=2)
    txt_2 = gr.Textbox(label="Input 2")
    txt_3 = gr.Textbox(value="", label="Output")
    btn = gr.Button(value="Submit")
    btn.click(combine, inputs=[txt, txt_2], outputs=[txt_3])

    with gr.Row():
        im = gr.Image()
        im_2 = gr.Image()

    btn = gr.Button(value="Mirror Image")
    btn.click(mirror, inputs=[im], outputs=[im_2])

    gr.Markdown("## Text Examples")
    gr.Examples(
        [["hi", "Adam"], ["hello", "Eve"]],
        [txt, txt_2],
        txt_3,
        combine,
        cache_examples=True,
    )
    gr.Markdown("## Image Examples")
    gr.Examples(
        examples=[gr.get_image("lion.jpg")],
        inputs=im,
        outputs=im_2,
        fn=mirror,
        cache_examples=True,
    )

if __name__ == "__main__":
    demo.launch()
