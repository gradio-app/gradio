import os.path
import gradio as gr


def load_mesh(mesh_file_name):
    file_dir = "demo/model3d/files"
    mesh_path = os.path.join(file_dir, mesh_file_name)
    return mesh_path


iface = gr.Interface(
    load_mesh,
    inputs=[
        gr.inputs.Dropdown(["Duck.glb", "Bunny.obj", "Fox.gltf"], type="value", default="Duck.glb", label="Mesh File")
    ],
    outputs=[
        "model3d"

        # to specify options use the object initializer
        # gr.outputs.Model(clear_color=[1.0, 1.0, 1.0], label="3D Model")
    ]
)

if __name__ == "__main__":
    iface.launch()
