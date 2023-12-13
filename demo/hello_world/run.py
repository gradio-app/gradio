import gradio as gr

def greet(name):
    import time
    time.sleep(10)
    return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs="text", outputs="text")
    
if __name__ == "__main__":
    demo.queue(max_size=1).launch(show_api=False)   