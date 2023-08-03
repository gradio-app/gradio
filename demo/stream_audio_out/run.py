import gradio as gr
import numpy as np
from pydub import AudioSegment
import time

def stream_audio(lag):
    audio_file = 'sample-15s.mp3'  # Your audio file path
    audio = AudioSegment.from_mp3(audio_file)
    chunk_length = 1000
    chunks = []
    while len(audio) > chunk_length:
        chunks.append(audio[:chunk_length])
        audio = audio[chunk_length:]
    if len(audio):  # Ensure we don't end up with an empty chunk
        chunks.append(audio)

    def iter_chunks():  
        for chunk in chunks:
            file_like_object = chunk.export(format="mp3")
            data = file_like_object.read()
            time.sleep(lag)
            yield data

    return iter_chunks()

demo = gr.Interface(
    stream_audio,
    gr.Slider(0, 3, 0, label="lag", info="Duration before generating next second of audio. >1s to cause lag."),
    gr.Audio(autoplay=True)
)

if __name__ == "__main__":
    demo.launch()