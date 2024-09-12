import gradio as gr
import time

def echo(message, history):
    time.sleep(2)
    return message["text"]

demo = gr.ChatInterface(
    fn=echo,
    type="messages",
    examples=[{"text": "hello"}, {"text": "hola"}, {"text": "merhaba"}],
    title="Echo Bot",
    multimodal=True,
)
demo.launch()
