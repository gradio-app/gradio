import time
import gradio as gr

def slow_echo(message, history):
    for i in range(len(message)):
        time.sleep(0.5)
        yield "You typed: " + message[: i + 1]

demo = gr.ChatInterface(slow_echo).queue()

if __name__ == "__main__":
    demo.launch()
