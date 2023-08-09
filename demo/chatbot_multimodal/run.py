import gradio as gr
import os
import time

# Chatbot demo with multimodal input (text, markdown, LaTeX, code blocks, image, audio, & video). Plus shows support for streaming text.

def add_text(history, message):
    history = history + [(message["text"], None)]
    if message["files"]:
        history = history + [((message["files"][0].name,), None)]
    return history, gr.update(value=None, interactive=False)

def bot(history):
    response = "**That's cool!**"
    history[-1][1] = ""
    for character in response:
        history[-1][1] += character
        time.sleep(0.05)
        yield history


with gr.Blocks() as demo:
    chatbot = gr.Chatbot([], elem_id="chatbot", height=750)

    with gr.Row():
        txt = gr.RichTextbox(show_label=False, placeholder="Enter text and press enter, or upload an image")
    txt_msg = txt.submit(add_text, [chatbot, txt], [chatbot, txt], queue=False).then(
        bot, chatbot, chatbot
    )
    txt_msg.then(lambda: gr.update(interactive=True), None, [txt], queue=False)

demo.queue()
if __name__ == "__main__":
    demo.launch()
