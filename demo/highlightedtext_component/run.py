import gradio as gr 

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

with gr.Blocks(css=css) as demo:
    gr.HighlightedText(value=[("Text","Label 1"),("to be","Label 2"),("highlighted","Label 3")])

demo.launch()