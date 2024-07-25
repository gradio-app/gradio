import gradio as gr
import numpy as np

def reverse_audio(audio):
    sr, data = audio
    return (sr, np.flipud(data))

demo = gr.Interface(fn=reverse_audio,
                    inputs="microphone",
                    outputs="audio")

if __name__ == "__main__":
    demo.launch()
