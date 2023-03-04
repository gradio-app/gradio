import gradio as gr
from urllib.parse import quote

def add_text(history, text):
    history = history + [(text, text + "?")]
    return history

def add_image(history, image):
    history = history + [(f"![](/file={quote(image.name)})", "Cool pic!")]
    return history


with gr.Blocks(css="#chatbot .overflow-y-auto{height:500px}") as demo:
    chatbot = gr.Chatbot(elem_id="chatbot")
    
    with gr.Row():
        with gr.Column(scale=0.85):
            txt = gr.Textbox(show_label=False, placeholder="Enter text and press enter, or upload an image").style(container=False)
        with gr.Column(scale=0.15, min_width=0):
            btn = gr.UploadButton("🖼️", file_types=["image"])
            
    txt.submit(add_text, [chatbot, txt], [chatbot])
    txt.submit(lambda :"", None, txt, queue=False)
    btn.upload(add_image, [chatbot, btn], [chatbot])
            
if __name__ == "__main__":
    demo.launch()