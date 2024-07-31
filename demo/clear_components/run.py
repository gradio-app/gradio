import gradio as gr
from datetime import datetime
import os
import random
import string
import pandas as pd

import numpy as np
import matplotlib.pyplot as plt

def random_plot():
    start_year = 2020
    x = np.arange(start_year, start_year + 5)
    year_count = x.shape[0]
    plt_format = "-"
    fig = plt.figure()
    ax = fig.add_subplot(111)
    series = np.arange(0, year_count, dtype=float)
    series = series**2
    series += np.random.rand(year_count)
    ax.plot(x, series, plt_format)
    return fig

images = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=386&q=80",
    "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW4lMjBmYWNlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
]
file_dir = os.path.join(os.path.dirname(__file__), "..", "kitchen_sink", "files")
model3d_dir = os.path.join(os.path.dirname(__file__), "..", "model3D", "files")
highlighted_text_output_1 = [
    {
        "entity": "I-LOC",
        "score": 0.9988978,
        "index": 2,
        "word": "Chicago",
        "start": 5,
        "end": 12,
    },
    {
        "entity": "I-MISC",
        "score": 0.9958592,
        "index": 5,
        "word": "Pakistani",
        "start": 22,
        "end": 31,
    },
]
highlighted_text_output_2 = [
    {
        "entity": "I-LOC",
        "score": 0.9988978,
        "index": 2,
        "word": "Chicago",
        "start": 5,
        "end": 12,
    },
    {
        "entity": "I-LOC",
        "score": 0.9958592,
        "index": 5,
        "word": "Pakistan",
        "start": 22,
        "end": 30,
    },
]

highlighted_text = "Does Chicago have any Pakistani restaurants"

def random_model3d():
    model_3d = random.choice(
        [os.path.join(model3d_dir, model) for model in os.listdir(model3d_dir) if model != "source.txt"]
    )
    return model_3d

components = [
    gr.Textbox(value=lambda: datetime.now(), label="Current Time"),
    gr.Number(value=lambda: random.random(), label="Random Percentage"),
    gr.Slider(minimum=0, maximum=100, randomize=True, label="Slider with randomize"),
    gr.Slider(
        minimum=0,
        maximum=1,
        value=lambda: random.random(),
        label="Slider with value func",
    ),
    gr.Checkbox(value=lambda: random.random() > 0.5, label="Random Checkbox"),
    gr.CheckboxGroup(
        choices=["a", "b", "c", "d"],
        value=lambda: random.choice(["a", "b", "c", "d"]),
        label="Random CheckboxGroup",
    ),
    gr.Radio(
        choices=list(string.ascii_lowercase),
        value=lambda: random.choice(string.ascii_lowercase),
    ),
    gr.Dropdown(
        choices=["a", "b", "c", "d", "e"],
        value=lambda: random.choice(["a", "b", "c"]),
    ),
    gr.Image(
        value=lambda: random.choice(images)
    ),
    gr.Video(value=lambda: os.path.join(file_dir, "world.mp4")),
    gr.Audio(value=lambda: os.path.join(file_dir, "cantina.wav")),
    gr.File(
        value=lambda: random.choice(
            [os.path.join(file_dir, img) for img in os.listdir(file_dir)]
        )
    ),
    gr.Dataframe(
        value=lambda: pd.DataFrame({"random_number_rows": range(5)}, columns=["one", "two", "three"])  # type: ignore
    ),
    gr.ColorPicker(value=lambda: random.choice(["#000000", "#ff0000", "#0000FF"])),
    gr.Label(value=lambda: random.choice(["Pedestrian", "Car", "Cyclist"])),
    gr.HighlightedText(
        value=lambda: random.choice(
            [
                {"text": highlighted_text, "entities": highlighted_text_output_1},
                {"text": highlighted_text, "entities": highlighted_text_output_2},
            ]
        ),
    ),
    gr.JSON(value=lambda: random.choice([{"a": 1}, {"b": 2}])),
    gr.HTML(
        value=lambda: random.choice(
            [
                '<p style="color:red;">I am red</p>',
                '<p style="color:blue;">I am blue</p>',
            ]
        )
    ),
    gr.Gallery(
        value=lambda: images
    ),
    gr.Model3D(value=random_model3d),
    gr.Plot(value=random_plot),
    gr.Markdown(value=lambda: f"### {random.choice(['Hello', 'Hi', 'Goodbye!'])}"),
]

def evaluate_values(*args):
    are_false = []
    for a in args:
        if isinstance(a, (pd.DataFrame, np.ndarray)):
            are_false.append(not a.any().any())  # type: ignore
        elif isinstance(a, str) and a.startswith("#"):
            are_false.append(a == "#000000")
        else:
            are_false.append(not a)
    return all(are_false)

with gr.Blocks() as demo:
    for i, component in enumerate(components):
        component.label = f"component_{str(i).zfill(2)}"
        component.render()
    clear = gr.ClearButton(value="Clear", components=components)
    result = gr.Textbox(label="Are all cleared?")
    hide = gr.Button(value="Hide")
    reveal = gr.Button(value="Reveal")
    clear_button_and_components = components + [clear]
    hide.click(
        lambda: [c.__class__(visible=False) for c in clear_button_and_components],
        inputs=[],
        outputs=clear_button_and_components
    )
    reveal.click(
        lambda: [c.__class__(visible=True) for c in clear_button_and_components],
        inputs=[],
        outputs=clear_button_and_components
    )
    get_value = gr.Button(value="Get Values")
    get_value.click(evaluate_values, components, result)

if __name__ == "__main__":
    demo.launch()
