import gradio as gr
import numpy as np
import time

def add_to_stream(audio, instream):
    time.sleep(1)
    if audio is None:
        return gr.update(), instream
    if instream is None:
        ret = audio
    else:
        ret = (audio[0], np.concatenate((instream[1], audio[1])))
    return ret, ret


with gr.Blocks() as demo:
    inp = gr.Audio(source="microphone")
    out = gr.Audio()
    stream = gr.State()
    clear = gr.Button("Clear")

    inp.stream(add_to_stream, [inp, stream], [out, stream])
    clear.click(lambda: [None, None, None], None, [inp, out, stream])


if __name__ == "__main__":
    demo.launch()