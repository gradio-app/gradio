import gradio as gr

def upload_file(files):
    file_paths = [file.name for file in files]
    return file_paths

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"
with gr.Blocks(css=css) as demo:
    file_output = gr.File()
    upload_button = gr.UploadButton("Click to Upload an Image or Video File", file_types=["image", "video"], file_count="multiple")
    upload_button.upload(upload_file, upload_button, file_output)

demo.launch()