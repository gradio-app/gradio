import gradio as gr
#from gradio import no_reload

if gr.NO_RELOAD:
    print("IN BAZ")

demo = 32

def baz_fn():
    print("In baz function")
    return 723

