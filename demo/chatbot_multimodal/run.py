import gradio as gr

with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    with gr.Row():
        with gr.Column(scale=0.85):
            gr.Textbox(show_label=False, placeholder="Enter text or upload an image").style(container=False)
        with gr.Column(scale=0.15, min_width=0):
            gr.UploadButton("🖼️", file_types=["image"])
            
if __name__ == "__main__":
    demo.launch()