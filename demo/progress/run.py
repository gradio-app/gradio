import gradio as gr
import random
import time


with gr.Blocks() as demo:
    text = gr.Textbox("Image search")
    btn = gr.Button("Go")
    img = gr.Image()

    def dummy(text, progress=gr.Progress()):
        imgs = [None] * 100

        # tqdm-like iterable wrapper
        for img in progress(imgs, label="Loading images..."):
            time.sleep(0.1)

        # explicit progress
        progress(0, label="Collecting Images...")
        time.sleep(3)
        progress(50, label="Collecting Images...")
        time.sleep(2)
        progress(100, label="Collecting Images...")



    btn.click(dummy, text, img)


if __name__ == "__main__":
    demo.queue().launch()
