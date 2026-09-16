import gradio as gr
from gradio.media import get_model3d

DEFAULT_VIEW = (90, 60, 200)

with gr.Blocks() as demo:
    gr.Markdown("Orbit and zoom the model, then capture the view you like.")

    model = gr.Model3D(
        value=get_model3d("Fox.gltf"),
        camera_position=DEFAULT_VIEW,
        label="Drag to orbit, scroll to zoom",
    )
    snippet = gr.Code(language="python", label="Use this view as your default")

    with gr.Row():
        capture_btn = gr.Button("Capture view", variant="primary")
        reset_btn = gr.Button("Back to default view")

    def capture_view(viewer: gr.Model3D):
        alpha, beta, radius = viewer.camera_position
        return f"gr.Model3D(camera_position=({alpha:.1f}, {beta:.1f}, {radius:.1f}))"

    capture_btn.click(capture_view, model, snippet)
    reset_btn.click(lambda: gr.Model3D(camera_position=DEFAULT_VIEW), None, model)

if __name__ == "__main__":
    demo.launch()
