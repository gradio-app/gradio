import gradio as gr
import numpy as np

def image_mod(img):
    return np.flipud(img)


demo = gr.Blocks()

with demo:
    text = gr.Image()
    btn = gr.Button("Run")
    btn.click(image_mod, text, text)

print(demo.get_config_file())

if __name__ == "__main__":
    demo.launch()
