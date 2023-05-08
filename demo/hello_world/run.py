import gradio as gr
import random

def greet(name):
    import time
    time.sleep(5)
    if random.random() < 0.5:
        raise ValueError("Random error!")
    return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs="text", outputs="text")
    
if __name__ == "__main__":
    demo.launch(show_traffic=True)