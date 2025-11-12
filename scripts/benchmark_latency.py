import time
import gradio as gr
from gradio_client import Client
import threading

with gr.Blocks() as demo:
    input = gr.Textbox(label="Input")
    output = gr.Textbox(label="Output")
    input.change(lambda x: x*2, input, output)

_, url, _ = demo.launch(prevent_thread_lock=True)

client = Client(url, verbose=False)

times = []

for _ in range(25):
    start = time.time()
    result = client.predict("Hello")
    end = time.time()
    times.append(end - start)

print(f"Serial average: {sum(times) / len(times)} seconds")

parallel_times = []
lock = threading.Lock()

def make_request():
    start = time.time()
    Client(url, verbose=False).predict("Hello")
    end = time.time()
    with lock:
        parallel_times.append(end - start)

threads = []
for _ in range(25):
    t = threading.Thread(target=make_request)
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(f"Parallel average: {sum(parallel_times) / len(parallel_times)} seconds")