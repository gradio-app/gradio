import gradio as gr
import time

def test(x):
    gr.Warning("step 1")
    yield "step 1"
    time.sleep(1)
    gr.Warning("step 2")
    yield "step 2"
    time.sleep(1)
    gr.Warning("done")
    # time.sleep(1) # If you uncomment this line, it works 
    yield "done"

gr.Interface(test, "textbox", "textbox").queue().launch()