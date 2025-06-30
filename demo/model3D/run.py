import gradio as gr
import os

def load_mesh(mesh_file_name):
    return mesh_file_name

demo = gr.Interface(
    fn=load_mesh,
    inputs=gr.Model3D(),
    outputs=gr.Model3D(
            clear_color=(0.8, 0.8, 0.8, 1.0),  label="3D Model", display_mode="wireframe"),
    examples=[
        [os.path.join(os.path.dirname(__file__), "files/Bunny.obj")],
        [os.path.join(os.path.dirname(__file__), "files/Duck.glb")],
        [os.path.join(os.path.dirname(__file__), "files/Fox.gltf")],
        [os.path.join(os.path.dirname(__file__), "files/face.obj")],
        [os.path.join(os.path.dirname(__file__), "files/sofia.stl")],
        ["https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k-mini.splat"],
        ["https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/luigi/luigi.ply"],
    ],
    cache_examples=True
)

if __name__ == "__main__":
    demo.launch()
