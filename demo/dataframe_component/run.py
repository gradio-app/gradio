import gradio as gr 

with gr.Blocks() as demo:
    gr.Dataframe(interactive=True)

demo.launch()