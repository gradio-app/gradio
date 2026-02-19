import gradio as gr
from pathlib import Path

with gr.Blocks() as demo:

    file_uploader = gr.HTML(
        html_template="""
        <div>
            <input type="file" id="file-input" accept="image/*" />
            <button id="upload-btn" style="margin-left: 8px;">Upload</button>
            <p id="status">No file uploaded yet.</p>
            <img id="preview" src="" style="max-width: 300px; display: none; margin-top: 8px;" />
        </div>
        """,
        js_on_load="""
        const input = element.querySelector('#file-input');
        const btn = element.querySelector('#upload-btn');
        const status = element.querySelector('#status');
        const preview = element.querySelector('#preview');

        btn.addEventListener('click', async () => {
            const file = input.files[0];
            if (!file) {
                status.textContent = 'Please select a file first.';
                return;
            }
            status.textContent = 'Uploading...';
            try {
                const path = await upload(file);
                status.textContent = 'Uploaded to: ' + path;
                props.value = path;
                preview.src = '/gradio_api/file=' + path;
                preview.style.display = 'block';
            } catch (e) {
                status.textContent = 'Upload failed: ' + e.message;
            }
        });
        """,
        elem_id="file_uploader"
    )
    view_upload_path_btn = gr.Button("View Uploaded File Path")

    upload_path = gr.Textbox(label="Uploaded File Path")

    view_upload_path_btn.click(lambda x:x, file_uploader,upload_path)


if __name__ == "__main__":
    demo.launch()
