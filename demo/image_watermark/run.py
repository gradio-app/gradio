import gradio as gr
import os

base_a = os.path.join(os.path.dirname(__file__), "files/groot.jpeg")
base_b = os.path.join(os.path.dirname(__file__), "files/bird.bmp")

watermark_a = os.path.join(os.path.dirname(__file__), "files/hf-logo_transpng.png")
watermark_b = os.path.join(os.path.dirname(__file__), "files/logo_nontrans.png")
watermark_c = os.path.join(os.path.dirname(__file__), "files/logo.png")

def generate_image(original_image, watermark_image):
    return gr.Image(original_image, watermark=gr.WatermarkOptions(watermark=watermark_image, position=(10,10)))


demo = gr.Interface(generate_image, [gr.Image(image_mode=None), gr.Image(image_mode=None)], gr.Image(),
                    examples=[[base_a, watermark_a], [base_b, watermark_b], [base_a, watermark_c], [base_a, watermark_c]])

if __name__ == "__main__":
    demo.launch()
