import gradio as gr
import subprocess
import os

audio_file = os.path.join(os.path.dirname(__file__), "cantina.wav")


with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.TabItem("Audio"):
            gr.Audio(audio_file)
        with gr.TabItem("Interface"):
            gr.Interface(lambda x:x, "audio", "audio", examples=[audio_file])
        with gr.TabItem("console"):
            gr.Interface(lambda cmd:subprocess.run([cmd], capture_output=True, shell=True).stdout.decode('utf-8').strip(), "text", "text")
        
if __name__ == "__main__":
    demo.launch()
