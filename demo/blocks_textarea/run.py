import gradio as gr
from gradio import Templates


def greet(name):
    return "Hello " + name + "!!"


demo = gr.Interface(fn=greet, inputs=Templates.TextArea(), outputs=Templates.TextArea())

if __name__ == "__main__":
    demo.launch()
