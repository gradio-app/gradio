import gradio as gr
import os

# css = (
#     "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"
# )

a = os.path.join(os.path.dirname(__file__), "files/world.mp4")  # Video
b = os.path.join(os.path.dirname(__file__), "files/a.mp4")  # Video
c = os.path.join(os.path.dirname(__file__), "files/b.mp4")  # Video
# with gr.Blocks(css=css) as demo:
#     gr.Video(video)
#     gr.Video()

# demo.launch()


gr.Interface(
    fn=lambda x: x,
    inputs=gr.Video(type="file"),
    outputs=gr.Video(),
    examples=[
        [a],
        [b],
        [c],
    ],
).launch()
