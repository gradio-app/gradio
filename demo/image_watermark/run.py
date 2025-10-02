import gradio as gr
import os
from gradio.media import get_image

# get_image() returns file paths to sample media included with Gradio
base_a = get_image("groot.jpeg")
base_b = os.path.join(os.path.dirname(__file__), "files/bird.bmp")

watermark_a = get_image("hf-logo_transpng.png")
watermark_b = os.path.join(os.path.dirname(__file__), "files/logo_nontrans.png")
watermark_c = get_image("logo.png")

def generate_image(original_image, watermark):
    return gr.Image(original_image, watermark=watermark)

demo = gr.Interface(generate_image, [gr.Image(image_mode=None), gr.Image(image_mode=None)], gr.Image(),
                    examples=[[base_a, watermark_a], [base_b, watermark_b], [base_a, watermark_c], [base_a, watermark_c]])

if __name__ == "__main__":
    demo.launch()
