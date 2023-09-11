import gradio as gr
from newtext import NewText

demo = gr.Interface(
    fn=lambda x: x,
    inputs=NewText(label="Text Input", lines=5),
    outputs=NewText(label="Text Input", lines=5),
)

demo.launch()
