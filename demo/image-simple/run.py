import gradio as gr


def image(s: gr.SelectData):
    print(s.index, s.selected, s.target, s.value, s._data)


with gr.Blocks() as demo:
    im = gr.Image()
    im2 = gr.Image()
    btn = gr.Button()
    btn.click(lambda x: x, outputs=im2, inputs=im)

    # im.select(image, outputs=None, inputs=None)

if __name__ == "__main__":
    demo.launch()
