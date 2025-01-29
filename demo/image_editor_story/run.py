import gradio as gr
from pathlib import Path
import subprocess


def predict(im):
    path = str(Path(__file__).parent / "output-image.png")
    with open(path, "wb") as f:
        f.write(Path(im["composite"]).read_bytes())
    print("Writing to ", path)
    return path


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            im = gr.ImageEditor(interactive=True, elem_id="image_editor",
                                canvas_size=(800, 600),
                                brush=gr.Brush(colors=["#ff0000", "#00ff00", "#0000ff"]),
                                type="filepath",
                            value={"background": "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
                                   "layers": [],
                                   "composite": None})
            get = gr.Button("Get")

        with gr.Column():
            output = gr.Image(value=None, elem_id="output")

        get.click(predict, inputs=im, outputs=output)

if __name__ == "__main__":
    app, _, _ = demo.launch(prevent_thread_lock=True)
    subprocess.call(["node", "js/storybook/ie_automation.js"])
    demo.close()
