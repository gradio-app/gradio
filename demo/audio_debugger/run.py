import gradio as gr
import subprocess

with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.TabItem("Audio"):
            gr.Audio("cantina.wav")
        with gr.TabItem("Interface"):
            gr.Interface(lambda x:x, "audio", "audio", examples=["cantina.wav"])
        with gr.TabItem("console"):
            gr.Interface(lambda cmd:subprocess.run([cmd], capture_output=True, shell=True).stdout.decode('utf-8').strip(), "text", "text")
        
if __name__ == "__main__":
    demo.launch()
