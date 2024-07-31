import gradio as gr

def image(im):
    return im

with gr.Blocks() as demo:
    im = gr.Image()
    im2 = gr.Image()
    btn = gr.Button()
    btn.click(lambda x: x, outputs=im2, inputs=im)

if __name__ == "__main__":
    demo.launch()
