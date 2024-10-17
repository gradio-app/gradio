import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_img = gr.Image(label="Input", sources="webcam")
        with gr.Column():
            output_img = gr.Image(label="Output")
        input_img.stream(lambda s: s, input_img, output_img, time_limit=15, stream_every=0.1, concurrency_limit=30)

if __name__ == "__main__":

    demo.launch()
