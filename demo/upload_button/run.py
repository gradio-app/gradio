import gradio as gr

def upload_file(files):
    if isinstance(files, list):
        file_paths = [file.name for file in files]
    else:
        file_paths = files.name
    return file_paths

with gr.Blocks() as demo:
    file_output = gr.File()
    upload_button = gr.UploadButton("Click to Upload a File", file_types=["image", "video"], file_count="single")
    upload_button.upload(upload_file, upload_button, file_output)

demo.launch()
