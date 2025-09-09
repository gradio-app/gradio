import gradio as gr
import time


def validate_input(x, y):
    print("VALIDATE", x)
    return [gr.validate(x != "error", "Can't be error"), gr.validate(True, "blanks")]


def do_chat(message, history):
    for i in range(len(message["text"])):
        time.sleep(0.05)
        yield "You typed: " + message["text"][: i + 1]


demo = gr.ChatInterface(fn=do_chat, validator=validate_input, type="messages")


if __name__ == "__main__":
    demo.launch()
