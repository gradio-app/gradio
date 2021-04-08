import gradio as gr
import time

def greet(name):
  print("->")
  time.sleep(1)
  return "Hello " + name + "!"

iface = gr.Interface(fn=greet, inputs="text", outputs="text")
if __name__ == "__main__":
    iface.launch()