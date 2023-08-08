import gradio as gr
from pydub import AudioSegment
import time


def stream_audio(audio_file, lag):
    audio = AudioSegment.from_mp3(audio_file)
    i = 0
    chunk_size = 3000
    
    while chunk_size*i < len(audio):
        time.sleep(lag)
        chunk = audio[chunk_size*i:chunk_size*(i+1)]
        i += 1
        if chunk:
            file = f"/tmp/{i}.mp3"
            chunk.export(file, format="mp3")            
            yield file, i
        
demo = gr.Interface(
    fn=stream_audio,
    inputs=[
        gr.Audio(type="filepath", label="Audio file to stream"),
        gr.Slider(0, 10, 0,
            label="lag",
            info="Duration before generating next 3 second chunk of audio. Set >3s to cause lag.",
        ),
    ],
    outputs=[
        gr.Audio(
            autoplay=True, 
            streaming=True), # needed to stream output audio
        gr.Textbox()
    ],
)

if __name__ == "__main__":
    demo.queue().launch()
