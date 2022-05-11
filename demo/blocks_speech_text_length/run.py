from transformers import pipeline
import torch

import gradio as gr

asr = pipeline("automatic-speech-recognition", "facebook/wav2vec2-base-960h")
classifier = pipeline("text-classification")


def speech_to_text(speech):
    text = asr(speech, chunk_length_s=10)["text"]
    return text


def text_to_sentiment(text):
    return classifier(text)[0]["label"]


demo = gr.Blocks()

with demo:
    m = gr.Audio(type="filepath")
    t = gr.Textbox()
    l = gr.Label()

    b1 = gr.Button("Recognize Speech")
    b2 = gr.Button("Classify Sentiment")

    b1.click(speech_to_text, inputs=m, outputs=t)
    b2.click(text_to_sentiment, inputs=t, outputs=l)

if __name__ == "__main__":
    demo.launch()
