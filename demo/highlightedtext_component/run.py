import gradio as gr

with gr.Blocks() as demo:
    gr.HighlightedText(
        value=[
            ("Text", "Label 1"),
            (" ", None),
            ("to be", "Label 2"),
            (" ", None),
            ("highlighted", "Label 3"),
        ],
        combine_adjacent=True,
        interactive=True,
    )

demo.launch()
