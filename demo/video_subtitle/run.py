import gradio as gr
import os

a = os.path.join(os.path.dirname(__file__), "files/a.mp4")  # Video
b = os.path.join(os.path.dirname(__file__), "files/b.mp4")  # Video
s1 = os.path.join(os.path.dirname(__file__), "files/s1.srt")  # Subtitle
s2 = os.path.join(os.path.dirname(__file__), "files/s2.vtt")  # Subtitle


def video_demo(video, subtitle=None):
    if subtitle is None:
        return video

    return [video, subtitle.name]


demo = gr.Interface(
    fn=video_demo,
    inputs=[
        gr.Video(type="file", label="In", interactive=True),
        gr.File(label="Subtitle", file_types=[".srt", ".vtt"]),
    ],
    outputs=gr.Video(label="Out"),
    examples=[
        [a, s1],
        [b, s2],
        [a, None],
    ],
)

if __name__ == "__main__":
    demo.launch()
