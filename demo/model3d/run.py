import os.path
import gradio as gr


def load_mesh(mesh_file_name):
    print("HIT!!!")
    print(mesh_file_name)
    # file_dir = "model3d/files"
    # mesh_path = os.path.join(file_dir, mesh_file_name)
    return mesh_file_name


    # inputs=[
    #     gr.inputs.Dropdown(["Duck.glb", "Bunny.obj", "Fox.gltf"], type="value", default="Duck.glb", label="Mesh File")
    # ]
iface = gr.Interface(
    load_mesh,
    "model3d",
    "model3d"
)

if __name__ == "__main__":
    iface.launch()
