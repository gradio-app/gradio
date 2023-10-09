import gradio as gr 

with gr.Blocks() as demo:
    gr.HighlightedText(value=[("Text","Label 1"),("to be","Label 2"),("highlighted","Label 3")])

demo.launch()