import gradio as gr


def image_mod(image):
    return image.rotate(45)


demo = gr.Interface(image_mod, gr.inputs.Image(type="pil"), "image", 
    flagging_options=["blurry", "incorrect", "other"])

if __name__ == "__main__":
    demo.launch()
