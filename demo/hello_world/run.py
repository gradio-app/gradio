import gradio as gr

def greet(name):
    import time
    time.sleep(1)
    return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs="text", outputs="text")
    
if __name__ == "__main__":
    demo.launch()   