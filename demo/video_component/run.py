import gradio as gr
import os


a = os.path.join(os.path.dirname(__file__), "files/world.mp4")  # Video
b = os.path.join(os.path.dirname(__file__), "files/a.mp4")  # Video
c = os.path.join(os.path.dirname(__file__), "files/b.mp4")  # Video


demo = gr.Interface(
    fn=lambda x: x,
    inputs=gr.Video(type="file"),
    outputs=gr.Video(),
    examples=[
        [a],
        [b],
        [c],
    ],
)

if __name__ == "__main__":
    demo.launch()
