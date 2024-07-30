import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("""
    # ⬆️📁 max_file_size test
    The demo has a max file size of 15kb. The error modal should pop up when a file larger than that is uploaded.          
    """)
    with gr.Row():
        with gr.Column():
            gr.Image(label="Image", interactive=True)
            gr.Gallery(label="Gallery", interactive=True)
            gr.File(label="Single File", interactive=True, file_count="single")
        with gr.Column():
            gr.Model3D(label="Model 3D", interactive=True,)
            gr.MultimodalTextbox(label="Multimodal Textbox", interactive=True)
            gr.UploadButton(label="Upload Button", interactive=True)
        with gr.Column():
            gr.Video(label="Video", interactive=True)
            gr.Audio(label="Audio", interactive=True)
            gr.File(label="Multiple Files", interactive=True, file_count="multiple")

if __name__ == "__main__":
    # The upload limit is set in playwright_setup.js
    # since the e2e tests use mount_gradio_app
    demo.launch(max_file_size="15kb")
