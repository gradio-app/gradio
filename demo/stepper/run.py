import gradio as gr

with gr.Blocks() as demo:
    with gr.Stepper(selected=0) as stepper:
        with gr.Step("Step 1", id=0):
            gr.Textbox("Step 1")
            gr.Button("Next").click(lambda: gr.Stepper(selected=1), outputs=stepper)
        with gr.Step("Step 2", id=1):
            gr.Textbox("Step 2")
            gr.Button("Previous").click(lambda: gr.Stepper(selected=2), outputs=stepper)
        with gr.Step("Step 3", id=2):
            gr.Textbox("Step 3")


if __name__ == "__main__":
    demo.launch()
