import gradio as gr
import time
import random

n_calls = 0

def get_random_number():
    global n_calls
    if n_calls == 1:
        n_calls += 1
        raise gr.Error("This is a gradio error")
    n_calls += 1
    time.sleep(5)
    return random.randrange(1, 10)

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            first = gr.Button("First Call")
            second = gr.Button("Second Call")
            third = gr.Button("Third Call")
            fourth = gr.Button("Fourth Call")
        with gr.Column():
            first_o = gr.Number(label="First Result")
            second_o = gr.Number(label="Second Result")
            third_o = gr.Number(label="Third Result")
            fourth_o = gr.Number(label="Fourth Result")

    first.click(get_random_number, None, first_o, concurrency_id="f")
    second.click(get_random_number, None, second_o, concurrency_id="f")
    third.click(get_random_number, None, third_o, concurrency_id="f")
    fourth.click(get_random_number, None, fourth_o, concurrency_id="f")

demo.queue(max_size=2)

if __name__ == "__main__":
    demo.launch()
