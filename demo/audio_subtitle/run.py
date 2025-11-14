import gradio as gr
from gradio.media import get_audio, get_file
from pathlib import Path

a = get_audio("cate_blanch.mp3")
b = get_audio("cate_blanch_2.mp3")
s1 = get_file("s1.srt")
s2 = get_file("s2.vtt")

p = Path(__file__).parent.parent.parent
demo_path = Path(p, "gradio/media_assets/").resolve()

print(demo_path)


def add_subtitles_to_audio(audio, subtitles=None):
    if subtitles is None:
        return audio
    if subtitles is not None:
        return gr.Audio(label="Out", value=audio, subtitles=subtitles.name)


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
    api_name="predict",
)

if __name__ == "__main__":
    demo.launch(allowed_paths=[demo_path])
