import random
import gradio as gr

def chat(message, history):
    history = history or []
    message = message.lower()
    if message.startswith("how many"):
        response = random.randint(1, 10)
    elif message.startswith("how"):
        response = random.choice(["Great", "Good", "Okay", "Bad"])
    elif message.startswith("where"):
        response = random.choice(["Here", "There", "Somewhere"])
    else:
        response = "I don't know"
    history.append((message, response))
    return history, history

chatbot = gr.Chatbot().style(color_map=("green", "pink"))
demo = gr.Interface(
    chat,
    ["text", "state"],
    [chatbot, "state"],
    allow_flagging="never",
)
if __name__ == "__main__":
    demo.launch()
