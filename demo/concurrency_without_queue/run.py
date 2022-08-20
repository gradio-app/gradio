import gradio as gr
import time


def say_hello(name):
  time.sleep(5)
  return f"Hello {name}!"


with gr.Blocks() as demo:
  inp = gr.Textbox()
  outp = gr.Textbox()
  button = gr.Button()
  button.click(say_hello, inp, outp)

  demo.launch(max_threads=41)
