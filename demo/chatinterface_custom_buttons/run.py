import gradio as gr
import random

def create_tuple_messages(data: gr.CustomButtonsData, history: list[gr.MessageDict]):
    return [["User message", "Chatbot message"]]

def random_response(message, history):
    return random.choice(["Yes", "No"])

examples = [
    {"role": "user", "content": "User message 1."},
    {"role": "user", "content": "User message 2."},
    {"role": "assistant", "content": "Chatbot message 1."},
]

with gr.Blocks() as demo:
    with gr.Row():
        chat_interface = gr.ChatInterface(
            fn=random_response,
            type="messages",
            custom_buttons=[
                {
                    "label": "Example1",
                    "visible": "chatbot",
                    "on_click": create_tuple_messages
                },
                {
                    "label": "Example2"
                },
            ],
        )

    with gr.Row():
        concatenated_text = gr.Textbox(label="Concatenated Chat")

    chat_interface.chatbot.change(lambda m: "|".join(m["content"] for m in m), chat_interface.chatbot, concatenated_text)

    demo.load(lambda: examples, None, chat_interface.chatbot)

if __name__ == "__main__":
    demo.launch()
