import gradio as gr
import os

# Base files for formats [jpeg, jpg, png]
base_a = os.path.join(os.path.dirname(__file__), "files/groot.jpeg")
base_b = os.path.join(os.path.dirname(__file__), "files/cheetah.jpg")
base_c = os.path.join(os.path.dirname(__file__), "files/lion.png")
base_d = os.path.join(os.path.dirname(__file__), "files/bird.bmp")

watermark_a = os.path.join(os.path.dirname(__file__), "files/hf-logo_jpeg.jpeg")
watermark_b = os.path.join(os.path.dirname(__file__), "files/frog.jpg")
watermark_c = os.path.join(os.path.dirname(__file__), "files/logo_nontrans.png")
watermark_d = os.path.join(os.path.dirname(__file__), "files/logo.png")
watermark_e = os.path.join(os.path.dirname(__file__), "files/bird.bmp")

def generate_image(original_image, watermark):
    return gr.Image(original_image, watermark=watermark)

demo = gr.Interface(generate_image, [gr.Image(type='filepath', image_mode=None), gr.Image(type='filepath', image_mode=None)], gr.Image(),
                    examples=[[base_a, watermark_a], [base_b, watermark_b], [base_c, watermark_c], [base_a, watermark_d], [base_b, watermark_e], [base_c, watermark_a], [base_d, watermark_a], [base_d, watermark_d]])

if __name__ == "__main__":
    demo.launch()
