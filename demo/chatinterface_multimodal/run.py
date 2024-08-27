import gradio as gr

def echo(message, history):
    return message["text"]

demo = gr.ChatInterface(
    fn=echo,
    suggestions=[{"icon": "files/avatar.png", "display_text": "Display Text Here!", "text": "Try this example with this audio.", "files": ["files/cantina.wav"]}, {"text": "Try this example with this image.", "files": ["files/avatar.png"]}, {"text": "This is just text, no files!"}, {"text": "Try this example with this image.", "files": ["files/avatar.png", "files/avatar.png"]}, {"text": "Try this example with this Audio.", "files": ["files/cantina.wav"]}],
    title="Echo Bot",
    multimodal=True,
)
demo.launch()
