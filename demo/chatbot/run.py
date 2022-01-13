import gradio as gr
import random

def chat(message, history):
    history = history or []
    if message.startswith("How many"):
        response = random.randint(1,10)
    elif message.startswith("How"):
        response = random.choice(["Great", "Good", "Okay", "Bad"])
    elif message.startswith("Where"):
        response = random.choice(["Here", "There", "Somewhere"])
    else:
        response = "I don't know"
    history.append((message, response))
    html = "<div class='chatbot'>"
    for user_msg, resp_msg in history:
        html += f"<div class='user_msg'>{user_msg}</div>"
        html += f"<div class='resp_msg'>{resp_msg}</div>"
    html += "</div>"
    return html, history

iface = gr.Interface(chat, ["text", "state"], ["html", "state"], css="""
    .chatbox {display:flex;flex-direction:column}
    .user_msg, .resp_msg {padding:4px;margin-bottom:4px;border-radius:4px;width:80%}
    .user_msg {background-color:cornflowerblue;color:white;align-self:start}
    .resp_msg {background-color:lightgray;align-self:self-end}
""", allow_screenshot=False, allow_flagging="never")
if __name__ == "__main__":
    iface.launch()