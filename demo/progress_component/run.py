import gradio as gr
import time 

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

def load_set(progress=gr.Progress()):
    imgs = [None] * 24
    for img in progress.tqdm(imgs, desc="Loading..."):
        time.sleep(0.1)
    return "Loaded"


with gr.Blocks(css=css) as demo:
    load = gr.Button("Load")
    label = gr.Label(label="Loader")
    load.click(load_set, outputs=label)

demo.queue(concurrency_count=20).launch()