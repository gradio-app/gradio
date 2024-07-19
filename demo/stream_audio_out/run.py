import gradio as gr
from pydub import AudioSegment
from time import sleep

with gr.Blocks() as demo:
    input_audio = gr.Audio(label="Input Audio", type="filepath", format="mp3")
    with gr.Row():
        with gr.Column():
            stream_as_file_btn = gr.Button("Stream as File")
            format = gr.Radio(["wav", "mp3"], value="wav", label="Format")
            stream_as_file_output = gr.Audio(streaming=True)

            def stream_file(audio_file, format):
                audio = AudioSegment.from_file(audio_file)
                i = 0
                chunk_size = 1000
                while chunk_size * i < len(audio):
                    chunk = audio[chunk_size * i : chunk_size * (i + 1)]
                    i += 1
                    if chunk:
                        file = f"/tmp/{i}.{format}"
                        chunk.export(file, format=format)
                        yield file
                        sleep(0.5)

            stream_as_file_btn.click(
                stream_file, [input_audio, format], stream_as_file_output
            )

            gr.Examples(
                [["audio/cantina.wav", "wav"], ["audio/cantina.wav", "mp3"]],
                [input_audio, format],
                fn=stream_file,
                outputs=stream_as_file_output,
            )

        with gr.Column():
            stream_as_bytes_btn = gr.Button("Stream as Bytes")
            stream_as_bytes_output = gr.Audio(streaming=True)

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
    demo.queue().launch()
