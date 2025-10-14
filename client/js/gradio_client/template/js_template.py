import gradio as gr
from rembg import remove, new_session
from PIL import Image
import io

# create session once to avoid reloading the model every time make infrence faster
session = new_session(model_name="u2netp")

def remove_background(input_image):
    if input_image is None:
        return None
    max_size = 1024
    input_image.thumbnail((max_size, max_size))
    img_bytes = io.BytesIO()
    input_image.save(img_bytes, format='PNG')
    img_bytes = img_bytes.getvalue()
    output_bytes = remove(img_bytes, session=session)
    output_image = Image.open(io.BytesIO(output_bytes))
    return output_image

with gr.Blocks(title="AI Background Remover") as demo:
    gr.HTML("""
    <div style="text-align:center;">
        <h2>AI Background Remover</h2>
        <p>Remove backgrounds instantly — 100% free and local!</p>
    </div>
    """)
    with gr.Row():
        input_img = gr.Image(type="pil", label="Upload Image")
        output_img = gr.Image(type="pil", label="Background Removed")
    with gr.Row():
        remove_btn = gr.Button("Remove Background")
        clear_btn = gr.Button("Clear")
    remove_btn.click(remove_background, inputs=input_img, outputs=output_img)
    clear_btn.click(lambda: (None, None), inputs=None, outputs=[input_img, output_img])

demo.launch(inbrowser=True)
