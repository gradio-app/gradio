import gradio as gr
from gradio.media import get_model3d


def load_mesh(mesh_file_name):
    return mesh_file_name


demo = gr.Interface(
    fn=load_mesh,
    inputs=gr.Model3D(label="Other name", display_mode="wireframe"),
    outputs=gr.Model3D(
        clear_color=(0.0, 0.0, 0.0, 0.0), label="3D Model", display_mode="wireframe"
    ),
    examples=[
        [get_model3d("bunny")],
        [get_model3d("duck")],
        [get_model3d("fox")],
        [get_model3d("face")],
        [get_model3d("sofia")],
        [
            "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k-mini.splat"
        ],
        [
            "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/luigi/luigi.ply"
        ],
    ],
    cache_examples=True,
)

if __name__ == "__main__":
    demo.launch()
