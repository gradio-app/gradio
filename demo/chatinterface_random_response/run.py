import random
import gradio as gr

def random_response(message, history):
    return random.choice(["Yes", "No"])

demo = gr.ChatInterface(random_response, autofocus=False, api_name="chat")

if __name__ == "__main__":
    demo.launch()
