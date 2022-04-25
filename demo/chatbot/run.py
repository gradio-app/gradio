import random

import gradio as gr


def chat(message, history):
    history = history or []
    if message.startswith("How many"):
        response = random.randint(1, 10)
    elif message.startswith("How"):
        response = random.choice(["Great", "Good", "Okay", "Bad"])
    elif message.startswith("Where"):
        response = random.choice(["Here", "There", "Somewhere"])
    else:
        response = "I don't know"
    history.append((message, response))
    return history, history

chatbot = gr.Chatbot(color_map=("red", "blue"))
demo = gr.Interface(
    chat,
    ["text", "state"],
    [chatbot, "state"],
    allow_screenshot=False,
    allow_flagging="never",
)
if __name__ == "__main__":
    demo.launch()
