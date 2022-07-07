import gradio as gr
with gr.Blocks() as demo:
    component = gr.Chatbot(value=[["Hello World","Hey Gradio!"],["❤️","😍"],["🔥","🤗"]])
demo.launch()