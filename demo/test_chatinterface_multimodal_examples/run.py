import gradio as gr

image = gr.get_image("avatar.png")
audio = gr.get_audio("cantina.wav")

def echo(message, history):
    return f"You wrote: {message['text']} and uploaded {len(message['files'])} files."

demo = gr.ChatInterface(
    fn=echo,
    examples=[{"text": "hello"}, {"text": "hola", "files": [image]}, {"text": "merhaba", "files": [image, audio]}],
    title="Echo Bot",
    multimodal=True,
)

if __name__ == "__main__":
    demo.launch()
