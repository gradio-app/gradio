import gradio as gr


def image(im):
    print(im)
    return im


with gr.Blocks() as demo:
    im = gr.ImageEditor()
    im2 = gr.ImageEditor()
    btn = gr.Button()
    btn.click(lambda x: x, outputs=im2, inputs=im)


if __name__ == "__main__":
    demo.launch()
