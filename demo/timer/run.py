import gradio as gr
import random
import time

with gr.Blocks() as demo:
  with gr.Row():
    min = gr.Number(1, label="Min")
    max = gr.Number(10, label="Max")
  timer = gr.Timer(1)
  number = gr.Number(lambda a,b: random.randint(a, b), inputs=[min, max], every=timer)
  with gr.Row():
    gr.Button("Start").click(lambda: gr.Timer(active=True), None, timer)
    gr.Button("Stop").click(lambda: gr.Timer(active=False), None, timer)
    gr.Button("Go Fast").click(lambda: 0.2, None, timer)
    gr.Button("Go Slow").click(lambda: 2, None, timer)

  timer2 = gr.Timer(1)
  timestamp = gr.Number(label="Time")
  timer2.tick(lambda: round(time.time()), outputs=timestamp)
    
if __name__ == "__main__":
  demo.launch()