import os

import numpy as np

import gradio as gr


def reverse_audio(audio):
    sr, data = audio
    return (sr, np.flipud(data))


demo = gr.Interface(fn=reverse_audio, 
                    inputs="microphone", 
                    outputs="audio", 
                    examples=[
                    "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
                    os.path.join(os.path.dirname(__file__), "audio/recording1.wav")
        ], cache_examples=True)

if __name__ == "__main__":
    demo.launch()
