import gradio as gr
import os


def load_mesh(mesh_file_name):
    return mesh_file_name


demo = gr.Interface(
    fn=load_mesh,
    inputs=gr.Model3D(),
    outputs=gr.Model3D(
            clear_color=[0.0, 0.0, 0.0, 0.0],  label="3D Model"),
    examples=[
        [os.path.join(os.path.dirname(__file__), "files/Bunny.obj")],
        [os.path.join(os.path.dirname(__file__), "files/Duck.glb")],
        [os.path.join(os.path.dirname(__file__), "files/Fox.gltf")],
        [os.path.join(os.path.dirname(__file__), "files/face.obj")],
    ],
)

if __name__ == "__main__":
    demo.launch()
