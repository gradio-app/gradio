"""This demo is only meant to test the unload event.
It will write to a file when the unload event is triggered.
May not work as expected if multiple people are using it.
"""
import gradio as gr
from pathlib import Path

log_file = (Path(__file__).parent / "output_log.txt").resolve()

def test_fn(x):
    with open(log_file, "a") as f:
        f.write(f"incremented {x}\n")
    return x + 1, x + 1

def delete_fn(v):
    with log_file.open("a") as f:
        f.write(f"deleted {v}\n")

def unload_fn():
   with log_file.open("a") as f:
      f.write("unloading\n")

with gr.Blocks() as demo:
    n1 = gr.Number(value=0, label="Number")
    state = gr.State(value=0, delete_callback=delete_fn)
    button = gr.Button("Increment")
    button.click(test_fn, [state], [n1, state], api_name="increment")
    demo.unload(unload_fn)
    demo.load(lambda: log_file.write_text(""))

if __name__ == "__main__":
    demo.launch()
