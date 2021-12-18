import os.path

import gradio as gr


def load_mesh(mesh_file_name):
    file_dir = "files"
    mesh_path = os.path.join(file_dir, mesh_file_name)
    return mesh_path


iface = gr.Interface(
    load_mesh,
    inputs=[
        gr.inputs.Dropdown(["Duck.glb"], type="value", default="Duck.glb", label="Mesh File")
    ],
    outputs=[
        "file"
    ]
)

if __name__ == "__main__":
    iface.launch()
