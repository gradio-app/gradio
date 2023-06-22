import gradio as gr
import os
os.environ['SYSTEM'] = "spaces"
os.environ['SPACE_ID'] = "aliabid94/golfy"


def welcome(name):
    return f"Welcome to Gradio, {name}!"


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            text = gr.Textbox(placeholder="What is your name?")
            num = gr.Slider()
            radio = gr.Radio(["a", "b", "c"])
            file = gr.File()
            btn = gr.Button("Run")
        with gr.Column():
            img = gr.Image()
            audio = gr.Audio()
            video = gr.Video()
            gallery = gr.Gallery()
            chatbot = gr.Chatbot()

    btn.click(
        lambda *args: [
            "files/lion.jpg",
            "files/cantina.wav",
            "files/world.mp4",
            ["files/lion.jpg", "files/tower.jpg"],
            [["Hey", "I'm bot"], ["I'm human", "Ok"]],
        ],
        [text, num, radio, file],
        [img, audio, video, gallery, chatbot],
    )

if __name__ == "__main__":
    demo.launch()
