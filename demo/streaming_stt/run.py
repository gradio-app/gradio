from deepspeech import Model
import gradio as gr
import numpy as np

model_file_path = "deepspeech-0.8.2-models.pbmm"
lm_file_path = "deepspeech-0.8.2-models.scorer"
beam_width = 100
lm_alpha = 0.93
lm_beta = 1.18

model = Model(model_file_path)
model.enableExternalScorer(lm_file_path)
model.setScorerAlphaBeta(lm_alpha, lm_beta)
model.setBeamWidth(beam_width)


def reformat_freq(sr, y):
    if sr not in (
        48000,
        16000,
    ):  # Deepspeech only supports 16k, (we convert 48k -> 16k)
        raise ValueError("Unsupported rate", sr)
    if sr == 48000:
        y = (
            ((y / max(np.max(y), 1)) * 32767)
            .reshape((-1, 3))
            .mean(axis=1)
            .astype("int16")
        )
        sr = 16000
    return sr, y


def transcribe(speech, stream):
    _, y = reformat_freq(*speech)
    if stream is None:
        stream = model.createStream()
    stream.feedAudioContent(y)
    text = stream.intermediateDecode()
    return text, stream

demo = gr.Interface(transcribe, ["microphone", "state"], ["text", "state"], live=True)

if __name__ == "__main__":
    demo.launch()