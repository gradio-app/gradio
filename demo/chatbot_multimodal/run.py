import gradio as gr
from urllib.parse import quote

def add_text(history, text):
    history = history + [(text, text + "?")]
    return history

def add_file(history, file):
    history = history + [((file.name,), "Cool file!")]
    return history

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(elem_id="chatbot").style(height=750)
    
    with gr.Row():
        with gr.Column(scale=0.85):
            txt = gr.Textbox(show_label=False, placeholder="Enter text and press enter, or upload an image").style(container=False)
        with gr.Column(scale=0.15, min_width=0):
            btn = gr.UploadButton("📁", file_types=["image", "video", "audio"])
    txt.submit(add_text, [chatbot, txt], [chatbot])
    txt.submit(lambda :"", None, txt, queue=False)
    btn.upload(add_file, [chatbot, btn], [chatbot])

if __name__ == "__main__":
    demo.launch()