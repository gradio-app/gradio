import gradio as gr
from pathlib import Path

current_file_path = Path(__file__).resolve()
relative_path = "path/to/file"
absolute_path = (current_file_path.parent / ".." / "..").resolve()
print(absolute_path)
with gr.Blocks() as demo:
    file = gr.HostFile(
        glob="**/*.{svelte,ts}", root=absolute_path, ignore_glob="**/node_modules/**"
    )
    submit_btn = gr.Button("Select")
    selected = gr.Textbox(label="Selected File")

    submit_btn.click(lambda x: x, file, selected)

if __name__ == "__main__":
    demo.launch()
