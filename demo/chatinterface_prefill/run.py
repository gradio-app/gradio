import gradio as gr
import random

def prefill_chatbot(choice):
    if choice == "Greeting":
        return [
            {"role": "user", "content": "Hi there!"},
            {"role": "assistant", "content": "Hello! How can I assist you today?"}
        ]
    elif choice == "Complaint":
        return [
            {"role": "user", "content": "I'm not happy with the service."},
            {"role": "assistant", "content": "I'm sorry to hear that. Can you please tell me more about the issue?"}
        ]
    else:
        return []

def random_response(message, history):
    return random.choice(["Yes", "No"])

with gr.Blocks() as demo:
    radio = gr.Radio(["Greeting", "Complaint", "Blank"])
    chat = gr.ChatInterface(random_response, type="messages")
    radio.change(prefill_chatbot, radio, chat.chatbot_value)

demo.launch()