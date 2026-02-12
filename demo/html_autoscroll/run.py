import gradio as gr
import time

def longer(val):
    for i in range(10):
        val = val + f"<p>This is paragraph {i+1}.</p>"
        time.sleep(0.2)
        yield val

with gr.Blocks() as demo:
    h = gr.HTML(value="<p>This is a paragraph 0.</p>", max_height=200, autoscroll=True)
    demo.load(longer, h, h)

demo.launch()
