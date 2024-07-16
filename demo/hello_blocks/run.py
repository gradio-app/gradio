import gradio as gr


def greet(name):
    return "Hello " + name + "!"


# with gr.Blocks() as demo:
#     name = gr.Textbox(label="Name")
#     output = gr.Textbox(label="Output Box")
#     greet_btn = gr.Button("Greet")
#     greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")

with gr.Blocks() as demo:
    audio = gr.Audio(label="Audio")
    file = gr.File(label="File")
    image = gr.Image(label="Image")
    video = gr.Video(label="Video")
    im_edit = gr.ImageEditor(label="Image Editor")
    model3d = gr.Model3D(label="3D Model")


if __name__ == "__main__":
    demo.launch()
