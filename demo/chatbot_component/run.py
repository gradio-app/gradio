import gradio as gr

with gr.Blocks() as demo:
    gr.Chatbot(value=[["Hello World","Hey Gradio!"],["❤️","😍"],["🔥","🤗"]])

demo.launch()