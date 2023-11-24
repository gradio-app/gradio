import gradio as gr


with gr.Blocks() as demo:
    chatbot = gr.Chatbot(
        value=[["Hello World", "Hey Gradio!"], ["❤️", "😍"], ["🔥", "🤗"]]
    )

demo.launch()
