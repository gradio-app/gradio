import gradio as gr
from gradio.media import get_image

def image_mod(image):
    return image.rotate(45)

# get_image() returns file paths to sample media included with Gradio
cheetah = get_image("cheetah1.jpg")

demo = gr.Interface(image_mod, gr.Image(type="pil", value=cheetah), "image",
                    api_name="predict",
    flagging_options=["blurry", "incorrect", "other"], examples=[
        get_image("lion.jpg"),
        get_image("logo.png")
        ])

if __name__ == "__main__":
    demo.launch(max_file_size="70kb")
