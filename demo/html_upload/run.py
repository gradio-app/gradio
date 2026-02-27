import gradio as gr
from pathlib import Path

with gr.Blocks() as demo:

    file_uploader = gr.HTML(
        html_template="""
        <div>
            <input type="file" id="file-input" accept=".txt,text/plain" />
            <button id="upload-btn" style="margin-left: 8px;">Upload</button>
        </div>
        """,
        js_on_load="""
        const input = element.querySelector('#file-input');
        const btn = element.querySelector('#upload-btn');

        btn.addEventListener('click', async () => {
            const file = input.files[0];
            const { path } = await upload(file);
            props.value = path;
        });
        """,
        elem_id="file_uploader"
    )

    view_content_btn = gr.Button("View Uploaded File Content")
    upload_content = gr.Textbox(label="Uploaded File Content")

    view_content_btn.click(lambda path: Path(path).read_text(), file_uploader, upload_content)

if __name__ == "__main__":
    demo.launch()
