import gradio as gr

with gr.Blocks() as demo:
    gr.HighlightedText(
        combine_adjacent=True,
    )

demo.launch()
