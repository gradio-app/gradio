from pathlib import Path
import gradio as gr

def upload_file(filepath):
    name = Path(filepath).name
    return [gr.UploadButton(visible=False), gr.DownloadButton(label=f"Download {name}", value=filepath, visible=True)]

def download_file():
    return [gr.UploadButton(visible=True), gr.DownloadButton(visible=False)]

with gr.Blocks() as demo:
    with gr.Row():
        gr.Markdown("Upload a file and then download it (but you get only one chance to download it!)")
        u = gr.UploadButton("Upload a file", file_count="single")
        d = gr.DownloadButton("Download a file", visible=False)

    u.upload(upload_file, u, [u, d])
    d.click(download_file, None, [u, d])


if __name__ == "__main__":
    demo.launch()