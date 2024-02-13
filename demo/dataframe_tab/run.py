import gradio as gr

with gr.Blocks() as demo:
    with gr.Tab():
        gr.HTML("<p>hi</p>")
    with gr.Tab():
        gr.Dataframe(
            value=[[i + 1] for i in range(10)],
        )

if __name__ == "__main__":
    demo.launch()
