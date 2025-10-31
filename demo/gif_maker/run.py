import gradio as gr
import os
import tempfile
from PIL import Image

def gif_maker(img_files):
    img_array = []
    for filename, _ in img_files:
        pil_img = Image.open(filename)
        if pil_img.mode in ('RGBA', 'LA', 'P'):
            pil_img = pil_img.convert('RGB')
        img_array.append(pil_img)
    
    with tempfile.NamedTemporaryFile(suffix='.gif', delete=False) as tmp_file:
        output_file = tmp_file.name
    
    if img_array:
        img_array[0].save(
            output_file,
            save_all=True,
            append_images=img_array[1:],
            duration=200,
            loop=0
        )
    return output_file

demo = gr.Interface(
    gif_maker,
    inputs=gr.Gallery(),
    outputs=gr.Image(),
    examples=[
        [[
            os.path.join(os.path.dirname(__file__), "images/1.png"),
            os.path.join(os.path.dirname(__file__), "images/2.png"),
            os.path.join(os.path.dirname(__file__), "images/3.png"),
        ]],
    ],
    api_name="predict"
)

if __name__ == "__main__":
    demo.launch()
