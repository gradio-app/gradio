import gradio as gr
import numpy as np
from typing import List


CHOICES = ["foo", "bar", "baz"]


def generate_tone(note=0, octave=1, duration=3):
    sr = 48000
    a4_freq, tones_from_a4 = 440, 12 * (octave - 4) + (note - 9)
    frequency = a4_freq * 2 ** (tones_from_a4 / 12)
    duration = int(duration)
    audio = np.linspace(0, duration, duration * sr)
    audio = (20000 * np.sin(audio * (2 * np.pi * frequency))).astype(np.int16)
    return sr, audio


def fn(
    *args,
    **kwargs,
):
    return (
        "Sample output text",
        {
            "positive": 0.287,
            "negative": 0.517,
            "neutral": 0.197,
        },
        generate_tone(),
        np.ones((300, 300, 3)),
    )


iface = gr.Interface(
    fn,
    inputs=[
        gr.inputs.Textbox(label="Textbox"),
        gr.inputs.Number(label="Number", default=42),
        gr.inputs.Slider(label="Slider"),
        gr.inputs.Checkbox(label="Checkbox"),
        gr.inputs.CheckboxGroup(label="CheckboxGroup", choices=CHOICES),
        gr.inputs.Radio(label="Radio", choices=CHOICES),
        gr.inputs.Dropdown(label="Dropdown", choices=CHOICES),
        gr.inputs.Image(label="Image"),
        # TODO(Uncomment those when supported by the React version)
        # gr.inputs.Video(),
        # gr.inputs.Audio(),
        # gr.inputs.File(),
        # gr.inputs.Dataframe(),
    ],
    outputs=[
        gr.outputs.Textbox(),
        gr.outputs.Label(),
        gr.outputs.Audio(type="numpy"),
        gr.outputs.Image(type="numpy"),
    ],
    theme="huggingface",
)

if __name__ == "__main__":
    iface.launch()
