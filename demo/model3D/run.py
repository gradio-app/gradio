import gradio as gr
# get_model3d() returns the file path to sample 3D models included with Gradio
from gradio.media import get_model3d, MEDIA_ROOT


def load_mesh(mesh_file_name):
    return mesh_file_name


demo = gr.Interface(
    fn=load_mesh,
    inputs=gr.Model3D(label="Other name", display_mode="wireframe"),
    outputs=gr.Model3D(
        clear_color=(0.0, 0.0, 0.0, 0.0), label="3D Model", display_mode="wireframe"
    ),
    examples=[
        [get_model3d("Bunny.obj")],
        [get_model3d("Duck.glb")],
        [get_model3d("Fox.gltf")],
        [get_model3d("face.obj")],
        [get_model3d("sofia.stl")],
        [
            "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k-mini.splat"
        ],
        [
            "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/luigi/luigi.ply"
        ],
    ],
    cache_examples=True,
    api_name="predict",
)

if __name__ == "__main__":
    demo.launch(allowed_paths=[str(MEDIA_ROOT)])
