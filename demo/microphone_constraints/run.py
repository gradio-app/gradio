import gradio as gr

constraints = {
    "echoCancellation": False,
    "noiseSuppression": False,
    "autoGainControl": True,
}

with gr.Blocks() as demo:
    gr.Markdown("""# Microphone Constraints
                The microphone is opened with echo cancellation and noise suppression turned off, using the following syntax:
                ```python
                gr.Audio(sources="microphone", microphone_options=gr.MicrophoneOptions(constraints={"echoCancellation": False, "noiseSuppression": False, "autoGainControl": True}))
                ```
                """)
    with gr.Tabs():
        with gr.Tab("Audio"):
            audio_in = gr.Audio(
                sources="microphone",
                microphone_options=gr.MicrophoneOptions(constraints=constraints),
            )
            audio_out = gr.Audio(label="Recorded audio")
            audio_in.stop_recording(lambda x: x, audio_in, audio_out)
        with gr.Tab("MultimodalTextbox"):
            textbox = gr.MultimodalTextbox(
                sources=["microphone"],
                microphone_options=gr.MicrophoneOptions(constraints=constraints),
            )
            submitted = gr.JSON(label="Submitted value")
            textbox.submit(lambda x: x, textbox, submitted)

if __name__ == "__main__":
    demo.launch()
