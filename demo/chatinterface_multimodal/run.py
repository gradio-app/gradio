import gradio as gr

def echo(message, history):
    return message["text"]

demo = gr.ChatInterface(
    fn=echo,
    type="messages",
    examples=[{"text": "hello"}, {"text": "hola"}, {"text": "merhaba"}],
    title="Echo Bot",
    multimodal=True,
)
demo.launch()
