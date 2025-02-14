import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        m = gr.Matrix(headers=["test", "bar"])
        gr.Button("FoO")


if __name__ == "__main__":
    demo.launch()