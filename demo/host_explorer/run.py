import gradio as gr
from pathlib import Path

current_file_path = Path(__file__).resolve()
relative_path = "path/to/file"
absolute_path = (current_file_path.parent / ".." / ".." / "gradio").resolve()


def get_file_content(file):
    with open(file) as f:
        x = f.read()

    return gr.Code(x, language="python")


with gr.Blocks() as demo:
    gr.Markdown('### `FileExplorer` to `FileExplorer` -- `file_count="multiple"`')
    submit_btn = gr.Button("Select")
    with gr.Row():
        file = gr.FileExplorer(
            ["themes/utils"],
            glob="**/{components,themes}/**/*.py",
            root=absolute_path,
            ignore_glob="**/__init__.py",
        )

        file2 = gr.FileExplorer(
            glob="**/{components,themes}/**/*.py",
            root=absolute_path,
            ignore_glob="**/__init__.py",
        )
    submit_btn.click(lambda x: x, file, file2)

    gr.Markdown("---")
    gr.Markdown('### `FileExplorer` to `Code` -- `file_count="single"`')
    submit_btn_2 = gr.Button("Select")
    with gr.Row():
        file_3 = gr.FileExplorer(
            ["themes/utils"],
            glob="**/{components,themes}/**/*.py",
            file_count="single",
            root=absolute_path,
            ignore_glob="**/__init__.py",
        )

        code = gr.Code()

    submit_btn_2.click(get_file_content, file_3, code)


if __name__ == "__main__":
    demo.launch()
