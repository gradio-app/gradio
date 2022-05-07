from matplotlib import interactive
import gradio as gr


demo = gr.Blocks()

with demo:
    with gr.Row():

        gr.Image(interactive=True)
        gr.Image()
    with gr.Row():
        with gr.Row():
            gr.Image(interactive=True)
            gr.Image()
            with gr.Column():
                gr.Image(interactive=True)
                gr.Image()
    gr.Image()


if __name__ == "__main__":
    demo.launch()
