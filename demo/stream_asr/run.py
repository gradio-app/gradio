import gradio as gr
from transformers import pipeline
import numpy as np

transcriber = pipeline("automatic-speech-recognition", model="openai/whisper-base.en")

def transcribe(stream, new_chunk):
    sr, y = new_chunk
    
    # Convert to mono if stereo
    if y.ndim > 1:
        y = y.mean(axis=1)
        
    y = y.astype(np.float32)
    y /= np.max(np.abs(y))

    if stream is not None:
        stream = np.concatenate([stream, y])
    else:
        stream = y
    return stream, transcriber({"sampling_rate": sr, "raw": stream})["text"]  # type: ignore

demo = gr.Interface(
    transcribe,
    ["state", gr.Audio(sources=["microphone"], streaming=True)],
    ["state", "text"],
    live=True,
)

if __name__ == "__main__":
    demo.launch()
