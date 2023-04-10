import gradio as gr
import os

a = os.path.join(os.path.dirname(__file__), "files/a.mp4")  # Video
b = os.path.join(os.path.dirname(__file__), "files/b.mp4")  # Video
s1 = os.path.join(os.path.dirname(__file__), "files/s1.srt")  # Subtitle
s2 = os.path.join(os.path.dirname(__file__), "files/s2.vtt")  # Subtitle


def video_demo(video, subtitle=None):
    if subtitle is None:
        return video

    return [video, subtitle]


inputs = [
    gr.Video(type="file", label="In", interactive=True),
    gr.File(label="Subtitle", accept=".srt,.vtt"),
]

outputs = gr.Video(label="Out", interactive=True)

examples = [
    [a, s1],
    [b, s2],
    [a, None],
]

demo = gr.Interface(fn=video_demo, inputs=inputs, outputs=outputs, examples=examples)


if __name__ == "__main__":
    demo.launch(inline=False, block=gr.Block(title="Video Subtitle Demo"))
