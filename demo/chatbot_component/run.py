import gradio as gr

with gr.Blocks() as demo:
    gr.Chatbot(value=[
        {"role": "user", "content": "Hello World"},
        {"role": "assistant", "content": "Hey Gradio!"},
        {"role": "user", "content": "❤️"},
        {"role": "assistant", "content": "😍"},
        {"role": "user", "content": "🔥"},
        {"role": "assistant", "content": "🤗"}
    ])

demo.launch()
