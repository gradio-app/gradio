import gradio as gr
from pathlib import Path

current_file_path = Path(__file__).resolve()
relative_path = "path/to/file"
absolute_path = (current_file_path.parent / ".." / ".." / "gradio").resolve()

def get_file_content(file):
    if file is None or Path(file).is_dir():
        return None
    return Path(file).read_text()

with gr.Blocks() as demo:
    gr.Markdown('### `FileExplorer` to `FileExplorer` -- `file_count="multiple"`')
    submit_btn = gr.Button("Select")
    with gr.Row():
        file = gr.FileExplorer(
            glob="**/components/*.py",
            root_dir=absolute_path,
            ignore_glob="**/__init__.py",
        )

        file2 = gr.FileExplorer(
            glob="**/components/*.py",
            root_dir=absolute_path,
            ignore_glob="**/__init__.py",
        )
    submit_btn.click(lambda x: x, file, file2)

    gr.Markdown("---")
    gr.Markdown('### `FileExplorer` to `Code` -- `file_count="single"`')
    with gr.Row():
        file_3 = gr.FileExplorer(
            scale=1,
            glob="**/components/**/*.py",
            value=["components/file_explorer.py"],
            file_count="single",
            root_dir=absolute_path,
            ignore_glob="**/__init__.py",
            elem_id="file",
            interactive=True,
        )

        code = gr.Code(lines=30, scale=2, language="python")

    file_3.change(get_file_content, file_3, code)

if __name__ == "__main__":
    demo.launch()
