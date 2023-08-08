import gradio as gr
import numpy as np
from pydub import AudioSegment
import time


def stream_audio(audio_file, lag):
    audio = AudioSegment.from_mp3(audio_file)
    chunk_length = 1000
    chunks = []
    while len(audio) > chunk_length:
        chunks.append(audio[:chunk_length])
        audio = audio[chunk_length:]
    if len(audio):  # Ensure we don't end up with an empty chunk
        chunks.append(audio)

    for i, chunk in enumerate(chunks):
        file = f"/tmp/{i}s.mp3"
        chunk.export(file, format="mp3")
        time.sleep(lag)
        yield file, i


demo = gr.Interface(
    stream_audio,
    [
        gr.Audio(type="filepath", label="Audio File"),
        gr.Slider(
            0,
            3,
            0,
            label="lag",
            info="Duration before generating next second of audio. >1s to cause lag.",
        ),
    ],
    [gr.Audio(autoplay=True, streaming=True), "textbox"],
)

if __name__ == "__main__":
    demo.queue().launch()
