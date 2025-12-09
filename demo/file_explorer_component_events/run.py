import gradio as gr
from pathlib import Path

base_root = Path(__file__).parent.resolve()

with gr.Blocks() as demo:
    with gr.Row():
        dd = gr.Dropdown(label="Select File Explorer Root",
                        value=str(base_root),
                        choices=[str(base_root),
                                 str(base_root / "dir1"),
                                 str(base_root / "dir2"),
                                 str(base_root / "dir3")])
        with gr.Group():
            txt_only_glob = gr.Checkbox(label="Show only text files", value=False)
            ignore_txt_in_glob = gr.Checkbox(label="Ignore text files in glob", value=False)

    btn = gr.Button("Programmatically select file")
    fe = gr.FileExplorer(root_dir=str(base_root), value=None,
                         glob="**/*", interactive=True)
    btn.click(lambda: str(base_root / "dir1" / "bar.txt"), inputs=[], outputs=[fe])
    selected_file = gr.Textbox(label="Last Selected (via .select())")
    run = gr.Button("Run")
    total_changes = gr.Number(0, elem_id="total-changes", label="# of Change Events")
    total_inputs = gr.Number(0, elem_id="total-inputs", label="# of Input Events")
    total_selects = gr.Number(0, elem_id="total-selects", label="# of Select Events")

    txt_only_glob.select(lambda s: gr.FileExplorer(glob="*.txt" if s else "*") ,
                         inputs=[txt_only_glob], outputs=[fe])
    ignore_txt_in_glob.select(lambda s: gr.FileExplorer(ignore_glob="*.txt" if s else None),
                            inputs=[ignore_txt_in_glob], outputs=[fe])

    dd.select(lambda s: gr.FileExplorer(root_dir=s), inputs=[dd], outputs=[fe])
    fe.change(lambda num: num + 1, inputs=total_changes, outputs=total_changes)
    fe.input(lambda num: num + 1, inputs=total_inputs, outputs=total_inputs)
    def on_select(evt: gr.SelectData, num: int):
        return f"Index: {evt.index}, Value: {evt.value}", num + 1
    fe.select(on_select, inputs=total_selects, outputs=[selected_file, total_selects])

    with gr.Row():
        a = gr.Textbox(elem_id="input-box")
        a.change(lambda x: x, inputs=[a])

if __name__ == "__main__":
    demo.launch()
