import gradio as gr
import os

a = os.path.join(os.path.dirname(__file__), "files/b.mp3")
b = os.path.join(os.path.dirname(__file__), "files/b.mp3")
s1 = os.path.join(os.path.dirname(__file__), "files/s1.srt")
s2 = os.path.join(os.path.dirname(__file__), "files/s2.vtt")

def audio_demo(audio, subtitle=None):
    if subtitle is None:
        return audio
    if subtitle is not None:
    return gr.Audio(label="Out", value=audio, subtitles=subtitle.name)

demo = gr.Interface(
    fn=audio_demo,
    inputs=[
        gr.Audio(label="In", interactive=True),
        gr.File(label="Subtitle", file_types=[".srt", ".vtt"]),
    ],
    outputs=gr.Audio(label="Out"),
)

if __name__ == "__main__":
    demo.launch()
