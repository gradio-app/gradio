import gradio as gr

def image_mod(image):
    return image.rotate(45)

iface = gr.Interface(image_mod, gr.inputs.Image(type="pil"), "image")
if __name__ == "__main__":
    iface.launch()
