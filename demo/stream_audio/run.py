import gradio as gr
import numpy as np

with gr.Blocks() as demo:
    inp = gr.Audio(source="microphone")
    out = gr.Audio()
    stream = gr.State()

    def add_to_stream(audio, instream):
        if audio is None:
            return gr.update(), instream
        if instream is None:
            ret = audio
        else:
            ret = (audio[0], np.concatenate((instream[1], audio[1])))
        return ret, ret
    inp.stream(add_to_stream, [inp, stream], [out, stream])

if __name__ == "__main__":
    demo.launch()