import gradio as gr
import os

a = os.path.join(os.path.dirname(__file__), "files/a.mp4")
b = os.path.join(os.path.dirname(__file__), "files/b.mp4")
s1 = os.path.join(os.path.dirname(__file__), "files/s1.srt")
s2 = os.path.join(os.path.dirname(__file__), "files/s2.vtt")
s3 = os.path.join(os.path.dirname(__file__), "files/s2.json")

def video_demo(video, subtitle=None):
    if subtitle is None:
        return video
    return gr.Video(label="Out", value=video, subtitles=subtitle.name)

demo = gr.Interface(
    fn=video_demo,
    inputs=[
        gr.Video(label="In", interactive=True),
        gr.File(label="Subtitle", file_types=[".srt", ".vtt", ".json"]),
    ],
    outputs=gr.Video(label="Out"),
    examples=[
        [a, s1],
        [b, s2],
        [a, s3],
    ],
)

if __name__ == "__main__":
    demo.launch()
