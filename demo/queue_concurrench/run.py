import gradio as gr
import asyncio


async def say_hello(name):
  await asyncio.sleep(5)
  return f"Hello {name}!"


with gr.Blocks() as demo:
  inp = gr.Textbox()
  outp = gr.Textbox()
  button = gr.Button()
  button.click(say_hello, inp, outp)

  demo.configure_queue(concurrency_count=5).launch(enable_queue=True)
