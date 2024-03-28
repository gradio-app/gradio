demo = 25
import gradio as gr

if gr.NO_RELOAD:
    print("42")

def foo_fn():
    print("In foo function!!")
    return demo + 25

