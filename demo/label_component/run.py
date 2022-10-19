import gradio as gr 

with gr.Blocks() as demo:
    gr.Label(value={"First Label": 0.7, "Second Label": 0.2, "Third Label": 0.1})

demo.launch()