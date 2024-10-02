import random
import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        clear_button = gr.Button("Clear")
        skip_button = gr.Button("Skip")
        random_button = gr.Button("Random")
    numbers = [gr.Number(), gr.Number()]

    clear_button.click(lambda : (None, None), outputs=numbers)
    skip_button.click(lambda : [gr.skip(), gr.skip()], outputs=numbers)
    random_button.click(lambda : (random.randint(0, 100), random.randint(0, 100)), outputs=numbers)

if __name__ == "__main__":
    demo.launch()