import random
import gradio as gr
import time

def random_response(message, history):
    time.sleep(3)
    return random.choice(["Yes", "No"])

demo = gr.ChatInterface(random_response, type="messages")

if __name__ == "__main__":
    demo.launch()
