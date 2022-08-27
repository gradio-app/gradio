import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column().style(width=360):
            text1 = gr.Textbox(label="prompt 1")
            text2 = gr.Textbox(label="prompt 2")
        with gr.Column():
            img1 = gr.Image("images/cheetah.jpg")
            btn = gr.Button("Go").style(full_width=True)
if __name__ == "__main__":
    demo.launch()