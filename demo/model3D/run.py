import os.path
import gradio as gr


def load_mesh(mesh_file_name):
    return mesh_file_name

inputs = gr.Model3D()
outputs = gr.Model3D()

iface = gr.Interface(fn=load_mesh, inputs=inputs, outputs=outputs)

if __name__ == "__main__":
    iface.launch()
