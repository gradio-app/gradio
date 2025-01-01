import gradio as gr

def image_mod(image):
    return image

demo = gr.Interface(
    image_mod,
    gr.Image(type="filepath"),
    "image",
)

if __name__ == "__main__":
    demo.launch(ssr_mode=True)
