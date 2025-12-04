import gradio as gr

with gr.Blocks() as demo:
    gr.HighlightedText(
        value=[("This is highlighted", "highlight"), ("This is not", None), ("This is also highlighted", "highlight")],
        color_map={"highlight": "yellow"},
        combine_adjacent=True,
    )

demo.launch()
