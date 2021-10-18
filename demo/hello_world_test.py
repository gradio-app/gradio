import gradio as gr
from random import choice

def greet(name):
  return "Hello " + name + "!!"

iface = gr.Interface(fn=greet, inputs="text", outputs="text")
u, p = choice("qwerty"), choice("asdf")
print(u, p)
if __name__ == "__main__":
    iface.launch(auth=(u,p), share=True)
