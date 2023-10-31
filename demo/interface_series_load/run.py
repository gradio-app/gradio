import gradio as gr
import numpy as np

generator = gr.load("huggingface/gpt2")


translator = gr.Interface(lambda s: "https://gradio-builds.s3.amazonaws.com/diffusion_image/cute_dog.jpg", gr.Textbox(), gr.Image())

demo = gr.Series(generator, translator, description="This demo combines two Spaces: a text generator (`huggingface/gpt2`) and a text translator (`huggingface/t5-small`). The first Space takes a prompt as input and generates a text. The second Space takes the generated text as input and translates it into another language.")

if __name__ == "__main__":
    demo.launch()