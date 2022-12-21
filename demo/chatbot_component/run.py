import gradio as gr

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

with gr.Blocks(css=css) as demo:
    gr.Chatbot(value=[["Hello World","Hey Gradio!"],["❤️","😍"],["🔥","🤗"]])

demo.launch()