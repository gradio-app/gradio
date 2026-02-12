import gradio as gr

with gr.Blocks() as demo:
    with gr.Walkthrough(selected=0) as walkthrough:
        with gr.Step("Image", id=0):
            image = gr.Image()
            btn = gr.Button("go to prompt")
            btn.click(lambda: gr.Walkthrough(selected=1), outputs=walkthrough)
        with gr.Step("Prompt", id=1):
            prompt = gr.Textbox()
            btn = gr.Button("generate")
            btn.click(lambda: gr.Walkthrough(selected=2), outputs=walkthrough)
        with gr.Step("Result", id=2):
            gr.Image(label="result", interactive=False)


if __name__ == "__main__":
    demo.launch()
