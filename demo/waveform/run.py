import gradio as gr
import random


COLORS = [
    ["#ff0000", "#00ff00"],
    ["#00ff00", "#0000ff"],
    ["#0000ff", "#ff0000"],
]    

def audio_waveform(audio, image):
    return (
        audio,
        gr.make_waveform(audio),
        gr.make_waveform(audio, bg_image=image, bars_color=random.choice(COLORS)),
    )


gr.Interface(
    audio_waveform,
    inputs=[gr.Audio(), gr.Image(type="filepath")],
    outputs=[
        gr.Audio(),
        gr.Video(),
        gr.Video(),
    ],
).launch()
