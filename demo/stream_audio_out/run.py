import gradio as gr

def stream_audio(audio_file):
    chunk_size = 50_000
    i = 0
    with open(audio_file, 'rb') as audio_data:
        while (chunk := audio_data.read(chunk_size)):
            yield chunk
        
demo = gr.Interface(
    fn=stream_audio,
    inputs=gr.Audio(type="filepath", label="Audio file to stream"),
    outputs=gr.Audio(autoplay=True, streaming=True),
)

if __name__ == "__main__":
    demo.queue().launch()
