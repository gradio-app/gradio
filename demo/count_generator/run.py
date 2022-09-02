import gradio as gr
import time

def count(n):
    for i in range(int(n)):
        time.sleep(0.5)
        yield i


demo = gr.Interface(count, gr.Number(value=10), gr.Number())


if __name__ == "__main__":
    demo.launch()
