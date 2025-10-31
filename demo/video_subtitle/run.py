import gradio as gr
from gradio.media import get_video, get_file

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
        [get_video("a.mp4"), get_file("s1.srt")],
        [get_video("b.mp4"), get_file("s2.vtt")],
        [get_video("a.mp4"), get_file("s3.json")],
    ],
    api_name="predict",
)

if __name__ == "__main__":
    demo.launch()
