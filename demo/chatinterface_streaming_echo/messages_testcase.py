import time
import gradio as gr


def slow_echo(message, history):
    yield "You typed: "
    for i in range(len(message)):
        time.sleep(0.05)
        yield message[i]


demo = gr.ChatInterface(slow_echo, msg_format="messages").queue()

if __name__ == "__main__":
    demo.launch()
