
import numpy as np

import gradio as gr

def reverse_audio(audio):
    sr, data = audio
    return (sr, np.flipud(data))

input_audio = gr.Audio(
    sources=["microphone"],
    waveform_options=gr.WaveformOptions(
        waveform_color="#01C6FF",
        waveform_progress_color="#0066B4",
        skip_length=2,
        show_controls=False,
    ),
)
demo = gr.Interface(
    fn=reverse_audio,
    inputs=input_audio,
    outputs="audio"
)

if __name__ == "__main__":
    demo.launch()
