import gradio as gr

def add_text(state, text):
    import time
    time.sleep(2)
    state = state + [(text, text + "?")]
    return state, state

def add_image(state, image):
    state = state + [(f"![](/file={image.name})", "Cool pic!")]
    return state, state


with gr.Blocks(css="#chatbot .overflow-y-auto{height:500px}") as demo:
    chatbot = gr.Chatbot(elem_id="chatbot")
    state = gr.State([])
    
    with gr.Row():
        with gr.Column(scale=0.85):
            txt = gr.Textbox(show_label=False, placeholder="Enter text and press enter, or upload an image").style(container=False)
        with gr.Column(scale=0.15, min_width=0):
            btn = gr.UploadButton("🖼️", file_types=["image"])
            
    txt.submit(add_text, [state, txt], [state, chatbot])
    txt.submit(lambda :"", None, txt)
    btn.upload(add_image, [state, btn], [state, chatbot])
            
if __name__ == "__main__":
    demo.launch()