import gradio as gr
from pathlib import Path

base_root = Path(__file__).parent.resolve()

with gr.Blocks() as demo:
    with gr.Row():
        dd = gr.Dropdown(label="Select File Explorer Root",
                        value=str(base_root / "dir1"),
                        choices=[str(base_root / "dir1"), str(base_root / "dir2"),
                                 str(base_root / "dir3")])
        with gr.Group():
            txt_only_glob = gr.Checkbox(label="Show only text files", value=False)
            ignore_txt_in_glob = gr.Checkbox(label="Ignore text files in glob", value=False)

    fe = gr.FileExplorer(root_dir=str(base_root / "dir1"),
                         glob="**/*", interactive=True)
    textbox = gr.Textbox(label="Selected Directory")
    run = gr.Button("Run")
    total_changes = gr.Number(0, elem_id="total-changes")

    txt_only_glob.select(lambda s: gr.FileExplorer(glob="*.txt" if s else "*") ,
                         inputs=[txt_only_glob], outputs=[fe])
    ignore_txt_in_glob.select(lambda s: gr.FileExplorer(ignore_glob="*.txt" if s else None),
                            inputs=[ignore_txt_in_glob], outputs=[fe])

    dd.select(lambda s: gr.FileExplorer(root_dir=s), inputs=[dd], outputs=[fe])
    run.click(lambda s: ",".join(s) if isinstance(s, list) else s, inputs=[fe], outputs=[textbox])
    fe.change(lambda num: num + 1, inputs=total_changes, outputs=total_changes)

    with gr.Row():
        a = gr.Textbox(elem_id="input-box")
        a.change(lambda x: x, inputs=[a])

if __name__ == "__main__":
    demo.launch()
