import gradio as gr
import os

a = os.path.join(os.path.dirname(__file__), "files/a.mp3")
b = os.path.join(os.path.dirname(__file__), "files/b.mp3")
s1 = os.path.join(os.path.dirname(__file__), "files/s1.srt")
s2 = os.path.join(os.path.dirname(__file__), "files/s2.vtt")

def add_subtitles_to_audio(audio, subtitle=None):
    if subtitle is None:
        return audio
    if subtitle is not None:
        return gr.Audio(label="Out", value=audio, subtitles=subtitle.name)

demo = gr.Interface(
    fn=add_subtitles_to_audio,
    inputs=[
        gr.Audio(label="In", interactive=True),
        gr.File(label="Subtitle", file_types=[".srt", ".vtt"]),
    ],
    outputs=gr.Audio(label="Out"),
    examples=[
        [a, s1],
        [b, s2],
    ],
)

if __name__ == "__main__":
    demo.launch()
