import time
import gradio as gr

runs = 0

def slow_echo(message, history):
    global runs  # i didn't want to add state or anything to this demo
    runs = runs + 1
    for i in range(len(message)):
        time.sleep(0.05)
        yield f"Run {runs} - You typed: " + message[: i + 1]


demo = gr.ChatInterface(slow_echo, type="messages").queue()

if __name__ == "__main__":
    demo.launch()
