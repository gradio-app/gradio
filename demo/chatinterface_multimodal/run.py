import gradio as gr

def echo(message, history):
    return message

demo = gr.ChatInterface(fn=echo, examples=["hello", "hola", "merhaba"], title="Echo Bot", multimodal=True)
demo.launch()
