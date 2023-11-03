import gradio as gr 

with gr.Blocks() as demo:
    cheetahs = [
        "https://gradio-builds.s3.amazonaws.com/assets/cheetah-003.jpg",
        "https://gradio-builds.s3.amazonaws.com/assets/lite-logo.png",
        "https://gradio-builds.s3.amazonaws.com/assets/TheCheethcat.jpg",
    ]
    with gr.Row():
        with gr.Column():
            btn = gr.Button()
        with gr.Column():
            gallery = gr.Gallery()
        with gr.Column():
            select_output = gr.Textbox(label="Select Data")
    btn.click(lambda: cheetahs, None, [gallery])

    def select(select_data: gr.SelectData):
        return select_data.value['image']['url']

    gallery.select(select, None, select_output)


if __name__ == "__main__":
    demo.launch()