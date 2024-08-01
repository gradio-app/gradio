import time
import gradio as gr

js_function = "() => {new Audio('file=beep.mp3').play();}"

def task(x):
    time.sleep(2)
    return "Hello, " + x

with gr.Blocks() as demo:
    name = gr.Textbox(label="name")
    greeting = gr.Textbox(label="greeting")
    name.blur(task, name, greeting)
    greeting.change(None, [], [], js=js_function)

demo.launch()
