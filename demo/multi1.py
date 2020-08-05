import gradio as gr
import numpy as np
import random

def answer_question(text, audio):
    return [
        ("The movie was ", "good"),
        ("unexpectedly, ", "great"),
        ("a fantastic experience ", "neutral"),
    ], {
        "address": "1 Main St.",
        "bedrooms": 5,
        "is_apt": False,
        "residents": [
            {"name": "Farhan", "age": 13},
            {"name": "Aziz", "age": 18},
            {"name": "Fozan", "age": None},
        ]
    }, "<div style='background-color: pink; padding: 2px;'>" + str(audio[1].shape) + "</div>", ""

gr.Interface(answer_question, 
            [
                gr.inputs.Dropdown(["cat", "dog", "bird"]),
                gr.inputs.Microphone(),
            ], 
            [
                gr.outputs.HighlightedText(color_map={"good": "lightgreen", "bad": "pink"}),
                gr.outputs.JSON(),
                gr.outputs.HTML(),
                gr.outputs.Audio(),
            ],
            ).launch()
