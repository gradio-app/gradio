import gradio as gr

def greet(name):
    return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs=["number"], outputs="text")
    
if __name__ == "__main__":
    demo.launch(show_api=False)   