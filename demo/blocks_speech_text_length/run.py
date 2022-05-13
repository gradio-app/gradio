# from transformers import pipeline

import gradio as gr

# asr = pipeline("automatic-speech-recognition", "facebook/wav2vec2-base-960h")
# classifier = pipeline("text-classification")


# def speech_to_text(speech):
#     text = asr(speech)["text"]
#     return text


# def text_to_sentiment(text):
#     return classifier(text)[0]["label"]


demo = gr.Blocks()

with demo:
    audio_file = gr.Audio(type="filepath")
    text = gr.Textbox()
    label = gr.Label()

    b1 = gr.Button("Recognize Speech")
    b2 = gr.Button("Classify Sentiment")

    # b1.click(speech_to_text, inputs=audio_file, outputs=text)
    # b2.click(text_to_sentiment, inputs=text, outputs=label)

if __name__ == "__main__":
    demo.launch()
