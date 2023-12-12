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
            dir_only_glob = gr.Checkbox(label="Show only directories", value=False)
            ignore_dir_in_glob = gr.Checkbox(label="Ignore directories in glob", value=False)

    fe = gr.FileExplorer(root=str(base_root / "dir1"),
                         glob="**/*", interactive=True)
    textbox = gr.Textbox(label="Selected Directory")
    run = gr.Button("Run")
    
    dir_only_glob.select(lambda s: gr.FileExplorer(glob="**/" if s else "**/*.*",
                                                   file_count="multiple",
                                                   root=str(base_root / "dir3")) ,
                         inputs=[dir_only_glob], outputs=[fe])
    ignore_dir_in_glob.select(lambda s: gr.FileExplorer(glob="**/*",
                                                        ignore_glob="**/",
                                                        root=str(base_root / "dir3")),
                            inputs=[ignore_dir_in_glob], outputs=[fe])            

    dd.select(lambda s: gr.FileExplorer(root=s), inputs=[dd], outputs=[fe])
    run.click(lambda s: ",".join(s) if isinstance(s, list) else s, inputs=[fe], outputs=[textbox])

    with gr.Row():
        a = gr.Textbox(elem_id="input-box")
        a.change(lambda x: x, inputs=[a])


if __name__ == "__main__":
    demo.launch()