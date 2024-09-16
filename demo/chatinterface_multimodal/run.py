import gradio as gr
import os

def echo(message, history):
    return message["text"]

demo = gr.ChatInterface(
    fn=echo,
    type="messages",
    examples=[{"text": "hello"}, {"text": "Try this example with this image.", "files": [os.path.join(os.path.dirname(__file__), "files/avatar.png")]}, {"text": "hola"}, {"text": "Try this example with this image.", "files": [os.path.join(os.path.dirname(__file__), "files/avatar.png"), os.path.join(os.path.dirname(__file__), "files/avatar.png")]}, {"text": "merhaba"}],
    title="Echo Bot",
    multimodal=True,
)
demo.launch()
