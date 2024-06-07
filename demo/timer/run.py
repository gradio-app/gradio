import gradio as gr
import random

with gr.Blocks() as demo:
  timer = gr.Timer(1, active=True)
  number = gr.Number()
  timer.tick(lambda: random.randint(1,100), None, number)

  gr.Button("Start").click(lambda: gr.Timer(active=True), None, timer)
  gr.Button("Stop").click(lambda: gr.Timer(active=False), None, timer)
  gr.Button("Go Fast").click(lambda: 0.2, None, timer)
  gr.Button("Go Slow").click(lambda: 2, None, timer)

if __name__ == "__main__":
  demo.launch()