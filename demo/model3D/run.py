import time
import gradio as gr

def load_mesh(mesh_file_name):
    time.sleep(2)
    return mesh_file_name

inputs = gr.Model3D()
outputs = gr.Model3D(clear_color=[0.8, 0.2, 0.2, 1.0])

iface = gr.Interface(
    fn=load_mesh, 
    inputs=inputs, 
    outputs=outputs,
    examples=[["files/Bunny.obj"], ["files/Duck.glb"], ["files/Fox.gltf"],["files/face.obj"]], cache_examples=True
)

if __name__ == "__main__":
    iface.launch()
