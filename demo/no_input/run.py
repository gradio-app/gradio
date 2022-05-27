import gradio as gr
import random

sentence_list = [
    "Good morning!",
    "Prayers are with you, have a safe day!",
    "I love you!"
]


def random_sentence():
    return sentence_list[random.randint(0, 2)]


demo = gr.Interface(fn=random_sentence, inputs=None, outputs="text")
demo.launch()
