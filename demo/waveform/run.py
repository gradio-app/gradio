import gradio as gr


def audio_waveform(audio, image):
    return (audio, audio, audio, gr.Waveform(audio=audio, bg_image=image))


gr.Interface(
    audio_waveform,
    inputs=[gr.Audio(type="filepath"), gr.Image(type="filepath")],
    outputs=[
        gr.Audio(),
        gr.Audio(waveform=True),
        gr.Audio(
            waveform=gr.Waveform(
                bars_color=("#00ff00", "#0011ff"), bar_count=100, bg_color="#000000"
            )
        ),
        gr.Audio(waveform=gr.Waveform()),
    ],
).launch()
