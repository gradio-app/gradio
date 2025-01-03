import time
import gradio as gr

def slow_echo(message, history):
    for i in range(len(message)):
        time.sleep(0.05)
        yield "You typed: " + message[: i + 1]

demo = gr.ChatInterface(slow_echo, type="messages", flagging_mode="manual", flagging_options=["Like", "Spam", "Inappropriate", "Other"], save_history=True)

if __name__ == "__main__":
    demo.launch()
