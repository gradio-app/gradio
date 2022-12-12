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
        audio,
        audio,
        audio,
        gr.Audio.update(
            value=audio,
            waveform=gr.Waveform(bg_image=image, bars_color=random.choice(COLORS)),
        ),
    )


gr.Interface(
    audio_waveform,
    inputs=[gr.Audio(type="filepath"), gr.Image(type="filepath")],
    outputs=[
        gr.Audio(),
        gr.Audio(waveform=True),
        gr.Audio(waveform="drake.jpg"),
        gr.Audio(
            waveform=gr.Waveform(
                bars_color=("#00ff00", "#0011ff"), bar_count=100, bg_color="#000000"
            )
        ),
        gr.Audio(waveform=True),
    ],
).launch()
