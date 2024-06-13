import gradio as gr
import random
import time

with gr.Blocks() as demo:
  timer = gr.Timer(1)
  timestamp = gr.Number(label="Time")
  timer.tick(lambda: round(time.time()), outputs=timestamp)

  with gr.Row():
    min = gr.Number(1, label="Min")
    max = gr.Number(10, label="Max")
  timer2 = gr.Timer(1)
  number = gr.Number(lambda a, b: random.randint(a, b), inputs=[min, max], every=timer2, label="Random Number")
  with gr.Row():
    gr.Button("Start").click(lambda: gr.Timer(active=True), None, timer2)
    gr.Button("Stop").click(lambda: gr.Timer(active=False), None, timer2)
    gr.Button("Go Fast").click(lambda: 0.2, None, timer2)
    gr.Button("Go Slow").click(lambda: 2, None, timer2)
    
if __name__ == "__main__":
  demo.launch()