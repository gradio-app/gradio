import gradio as gr
import subprocess
import os

audio_file = os.path.join(os.path.dirname(__file__), "cantina.wav")


with gr.Blocks() as demo:
    with gr.Tab("Audio"):
        gr.Audio(audio_file)
    with gr.Tab("Interface"):
        gr.Interface(lambda x:x, "audio", "audio", examples=[audio_file])
    with gr.Tab("console"):
        gr.Interface(lambda cmd:subprocess.run([cmd], capture_output=True, shell=True).stdout.decode('utf-8').strip(), "text", "text")
        
if __name__ == "__main__":
    demo.launch()
