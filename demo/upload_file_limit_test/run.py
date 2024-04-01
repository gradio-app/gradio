import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("""
    # ⬆️📁 max_file_size test
    Components have a max file size of 1kb (disabling upload). The error modal should pop up when a file is uploaded.          
    """)
    with gr.Row():
        with gr.Column():
            gr.Image(label="Image", interactive=True, max_file_size="1b")
            gr.Gallery(label="Gallery", interactive=True, max_file_size="1b")
            gr.File(label="Single File", interactive=True, max_file_size="1b", file_count="single")
        with gr.Column():
            gr.Model3D(label="Model 3D", interactive=True, max_file_size="1b")
            gr.MultimodalTextbox(label="Multimodal Textbox", interactive=True, max_file_size="1b")
            gr.UploadButton(label="Upload Button", interactive=True, max_file_size="1b")
        with gr.Column():
            gr.Video(label="Video", interactive=True, max_file_size="1b")
            gr.Audio(label="Audio", interactive=True, max_file_size="1b")
            gr.File(label="Multiple Files", interactive=True, max_file_size="1b", file_count="multiple")


if __name__ == "__main__":
    demo.launch()