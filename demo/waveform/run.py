import gradio as gr

def audio_waveform(audio, image):
    return gr.Waveform(audio, bg_image=image)

gr.Interface(
    audio_waveform,
    inputs=[gr.Audio(type="filepath"), gr.Image(type="filepath")],
    outputs=gr.Audio(),
).launch()
