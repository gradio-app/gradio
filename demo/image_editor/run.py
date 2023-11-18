import gradio as gr


def image(im):
    print(im)
    return [im["background"], im["layers"][0], im["layers"][1], im["composite"]]


with gr.Blocks() as demo:
    im = gr.ImageEditor(type="pil", crop_size="1:1", interactive=True)
    # with gr.Row():
    #     im2 = gr.Image()
    #     im3 = gr.Image()
    #     im4 = gr.Image()
    #     im5 = gr.Image()
    im_out = gr.ImageEditor(type="pil", interactive=True)

    btn = gr.Button()
    # btn.click(image, outputs=[im2, im3, im4, im5], inputs=im)
    im.change(lambda x: x, outputs=im_out, inputs=im)

# import gradio as gr

# demo = gr.Interface(lambda x: x, gr.ImageEditor(), gr.ImageEditor())

# if __name__ == "__main__":
#     demo.launch()

if __name__ == "__main__":
    demo.launch()
