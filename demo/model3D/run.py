import time
import gradio as gr
import os


def load_mesh(mesh_file_name):
    time.sleep(2)
    return mesh_file_name


inputs = gr.Model3D()
outputs = gr.Model3D(clear_color=[0.8, 0.2, 0.2, 1.0])

demo = gr.Interface(
    fn=load_mesh,
    inputs=inputs,
    outputs=outputs,
    examples=[
        [os.path.join(os.path.dirname(__file__), "files/Bunny.obj")],
        [os.path.join(os.path.dirname(__file__), "files/Duck.glb")],
        [os.path.join(os.path.dirname(__file__), "files/Fox.gltf")],
        [os.path.join(os.path.dirname(__file__), "files/face.obj")],
    ],
    cache_examples=True,
)

if __name__ == "__main__":
    demo.launch()
