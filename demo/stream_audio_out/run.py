import gradio as gr
from gradio import processing_utils
from time import sleep
import os
import tempfile
from pathlib import Path

with gr.Blocks() as demo:
    input_audio = gr.Audio(label="Input Audio", type="filepath", format="mp3")
    with gr.Row():
        with gr.Column():
            stream_as_file_btn = gr.Button("Stream as File")
            format = gr.Radio(["wav", "mp3"], value="wav", label="Format")
            stream_as_file_output = gr.Audio(streaming=True, elem_id="stream_as_file_output", autoplay=True, visible=False)

            def stream_file(audio_file, format):
                sample_rate, data = processing_utils.audio_from_file(audio_file)
                chunk_size = sample_rate  # one second of audio per chunk
                for i, start in enumerate(range(0, len(data), chunk_size), start=1):
                    file = Path(tempfile.gettempdir()) / "stream_audio_demo" / f"{i}.{format}"
                    file.parent.mkdir(parents=True, exist_ok=True)
                    processing_utils.audio_to_file(
                        sample_rate, data[start : start + chunk_size], str(file), format=format
                    )
                    yield file
                    sleep(0.5)

            stream_as_file_btn.click(
                stream_file, [input_audio, format], stream_as_file_output
            )

            gr.Examples(
                [[gr.get_audio("cantina.wav"), "wav"],
                 [gr.get_audio("cantina.wav"), "mp3"]],
                [input_audio, format],
                fn=stream_file,
                outputs=stream_as_file_output,
                cache_examples=False,
            )

        with gr.Column():
            stream_as_bytes_btn = gr.Button("Stream as Bytes")
            stream_as_bytes_output = gr.Audio(streaming=True, elem_id="stream_as_bytes_output", autoplay=True)

            def stream_bytes(audio_file):
                chunk_size = 20_000
                with open(audio_file, "rb") as f:
                    while True:
                        chunk = f.read(chunk_size)
                        if chunk:
                            yield chunk
                            sleep(1)
                        else:
                            break
            stream_as_bytes_btn.click(stream_bytes, input_audio, stream_as_bytes_output)

if __name__ == "__main__":
    demo.launch()
