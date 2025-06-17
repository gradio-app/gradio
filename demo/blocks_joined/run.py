from time import sleep
import gradio as gr
import os

cheetah = os.path.join(os.path.dirname(__file__), "files/cheetah1.jpg")

def img(text):
    sleep(3)
    return [
        cheetah,
        cheetah,
        cheetah,
        cheetah,
        cheetah,
        cheetah,
        cheetah,
        cheetah,
        cheetah,
    ]

with gr.Blocks(css=".container { max-width: 800px; margin: auto; }") as demo:
    gr.Markdown("<h1><center>DALL·E mini</center></h1>")
    gr.Markdown(
        "DALL·E mini is an AI model that generates images from any prompt you give!"
    )
    with gr.Group():
        with gr.Row(equal_height=True):
            text = gr.Textbox(
                label="Enter your prompt",
                max_lines=1,
                container=False,
            )
            btn = gr.Button("Run", scale=0)
        gallery = gr.Gallery(
            label="Generated images",
            show_label=False,
            columns=1,
            height="auto",
        )
    btn.click(img, inputs=text, outputs=gallery)

if __name__ == "__main__":
    demo.launch()

# margin = (TOP, RIGHT, BOTTOM, LEFT)
# rounded = (TOPLEFT, TOPRIGHT, BOTTOMRIGHT, BOTTOMLEFT)
