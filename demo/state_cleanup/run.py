from __future__ import annotations
import gradio as gr
import numpy as np
from PIL import Image
from pathlib import Path
import secrets
import shutil

current_dir = Path(__file__).parent

def generate_random_img(history: list[Image.Image], request: gr.Request):
    """Generate a random red, green, blue, orange, yellor or purple image."""
    colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 165, 0), (255, 255, 0), (128, 0, 128)]
    color = colors[np.random.randint(0, len(colors))]
    img = Image.new('RGB', (100, 100), color)

    user_dir: Path = current_dir / str(request.session_hash)
    user_dir.mkdir(exist_ok=True)
    path = user_dir / f"{secrets.token_urlsafe(8)}.webp"

    img.save(path)
    history.append(img)

    return img, history, history

def delete_directory(req: gr.Request):
    if not req.username:
        return
    user_dir: Path = current_dir / req.username
    shutil.rmtree(str(user_dir))

with gr.Blocks(delete_cache=(60, 3600)) as demo:
    gr.Markdown("""# State Cleanup Demo
                🖼️ Images are saved in a user-specific directory and deleted when the users closes the page via demo.unload.
                """)
    with gr.Row():
        with gr.Column(scale=1):
            with gr.Row():
                img = gr.Image(label="Generated Image", height=300, width=300)
            with gr.Row():
                gen = gr.Button(value="Generate")
            with gr.Row():
                history = gr.Gallery(label="Previous Generations", height=500, columns=10)
                state = gr.State(value=[], delete_callback=lambda v: print("STATE DELETED"))

    demo.load(generate_random_img, [state], [img, state, history])
    gen.click(generate_random_img, [state], [img, state, history])
    demo.unload(delete_directory)

demo.launch()
