import gradio as gr
import random
import time

def add_message(chat_history, message):
    return chat_history + [[message, None]]


def respond(chat_history):
    time.sleep(1)
    response = random.choice(["Yes", "No"])
    chat_history[-1][1] = response
    return chat_history


with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    msg = gr.Textbox()
    clear = gr.Button("Clear")

    msg.submit(add_message, [chatbot, msg], chatbot).then(respond, chatbot, chatbot)
    clear.click(lambda: None, None, chatbot)

if __name__ == "__main__":
    demo.launch()
