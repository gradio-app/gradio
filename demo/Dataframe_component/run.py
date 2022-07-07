import gradio as gr
with gr.Blocks() as demo:
     component = gr.Dataframe(interactive=True)
demo.launch()