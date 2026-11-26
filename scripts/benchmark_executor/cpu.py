"""A function that is about 1 s of pure-Python compute (holds the GIL throughout)."""

import os
import time

import gradio as gr


def work(message, seed):
    start = time.perf_counter()
    total = 0
    while time.perf_counter() - start < 1.0:
        for i in range(20000):
            total += i * i % 7
    return f"{message}: {total}", round(time.perf_counter() - start, 4)


demo = gr.Interface(
    fn=work,
    inputs=[gr.Textbox(), gr.Number(value=0, precision=0)],
    outputs=[gr.Textbox(), gr.Number()],
    api_name="generate",
)

if __name__ == "__main__":
    demo.launch(server_port=int(os.environ["BENCH_PORT"]), inbrowser=False)
