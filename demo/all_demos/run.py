import gradio as gr
import os

os.environ["SYSTEM"] = "spaces"
os.environ["SPACE_ID"] = "aliabid94/golfy"


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

    def click(*args):
        import time
        time.sleep(4)
        return [
            "files/lion.jpg",
            "files/cantina.wav",
            "files/world.mp4",
            ["files/lion.jpg", "files/tower.jpg"],
            [
                ["Hey", "I'm a **bot**"],
                ["I'm human", "Ok"],
                [None, "What should I do?"],
                ["Draw a lion", ("files/lion.jpg",)],
            ],
        ]

    btn.click(
        click,
        [text, num, radio, file],
        [img, audio, video, gallery, chatbot],
    )

if __name__ == "__main__":
    demo.launch()
