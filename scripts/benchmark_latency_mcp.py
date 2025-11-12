import time
import gradio as gr
from gradio_client import Client

with gr.Blocks() as demo:
    input = gr.Textbox(label="Input")
    output = gr.Textbox(label="Output")
    demo.load(lambda x: x, input, output)

_, url, _ = demo.launch(prevent_thread_lock=True)

client = Client(url)

times = []

for _ in range(25):
    start = time.time()
    client.predict("Hello")
    end = time.time()
    times.append(end - start)

print(f"Average time taken: {sum(times) / len(times)} seconds")