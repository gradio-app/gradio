from pathlib import Path
import gradio as gr

image = str(Path(__file__).parent / "files" / "avatar.png")
audio = str(Path(__file__).parent / "files" / "cantina.wav")

def echo(message, history):
    return f"You wrote: {message['text']} and uploaded {len(message['files'])} files."

demo = gr.ChatInterface(
    fn=echo,
    type="messages",
    examples=[{"text": "hello"}, {"text": "hola", "files": [image]}, {"text": "merhaba", "files": [image, audio]}],
    title="Echo Bot",
    multimodal=True,
)

if __name__ == "__main__":
    demo.launch()
