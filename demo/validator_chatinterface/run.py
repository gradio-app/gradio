import gradio as gr
import time


def validate_input(x):
    print("VALIDATE", x)
    return gr.validate(x != "error", "Can't be error")


def do_chat(message, history):
    for i in range(len(message)):
        time.sleep(0.05)
        yield "You typed: " + message[: i + 1]


demo = gr.ChatInterface(fn=do_chat, validator=validate_input, type="messages", show_progress="full")


if __name__ == "__main__":
    demo.launch()
