import random
import gradio as gr

def random_response(message, history):
    return random.choice(["Yes", "No"])

demo = gr.ChatInterface(random_response, type="messages", examples=[
    "Flip a coin", "What's my name?"
])

if __name__ == "__main__":
    demo.launch()
