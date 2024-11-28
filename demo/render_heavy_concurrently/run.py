import gradio as gr
import random

with gr.Blocks() as demo:

    with gr.Row():

        @gr.render()
        def render():
            for i in range(500):
                gr.Textbox(random.randint(0, 100))            
            gr.Button("DONE 1")

        @gr.render()
        def render():
            for i in range(500):
                gr.Textbox(random.randint(0, 100))
            gr.Button("DONE 2")

if __name__ == "__main__":
    demo.queue(default_concurrency_limit=64).launch()
