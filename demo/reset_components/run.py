import gradio as gr
from datetime import datetime
import os
import random
import string
import pandas as pd

from demos.kitchen_sink_random.constants import (
    file_dir,
    img_dir,
    highlighted_text,
    highlighted_text_output_2,
    highlighted_text_output_1,
    random_plot,
    random_model3d,
)


components = [
    gr.Textbox(value=lambda: datetime.now(), label="Current Time"),
    gr.Number(value=lambda: random.random(), label="Random Percentage"),
    gr.Slider(minimum=-1, maximum=1, randomize=True, label="Slider with randomize"),
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
        value=lambda: random.choice(
            [os.path.join(img_dir, img) for img in os.listdir(img_dir)]
        )
    ),
    gr.Video(value=lambda: os.path.join(file_dir, "world.mp4")),
    gr.Audio(value=lambda: os.path.join(file_dir, "cantina.wav")),
    gr.File(
        value=lambda: random.choice(
            [os.path.join(file_dir, img) for img in os.listdir(file_dir)]
        )
    ),
    gr.Dataframe(
        value=lambda: pd.DataFrame({"random_number_rows": range(random.randint(0, 10))})
    ),
    gr.Timeseries(value=lambda: os.path.join(file_dir, "time.csv")),
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
        value=lambda: [os.path.join(img_dir, img) for img in os.listdir(img_dir)]
    ),
    gr.Model3D(value=random_model3d),
    gr.Plot(value=random_plot),
    gr.Markdown(value=lambda: f"### {random.choice(['Hello', 'Hi', 'Goodbye!'])}"),
]


with gr.Blocks() as demo:
    for component in components:
        component.render()
    reset = gr.Button(value="Reset")
    hide = gr.Button(value="Hide")
    reset.click(
        lambda: [c.update(value=gr.VOID) for c in components],
        inputs=[],
        outputs=components,
    )
    hide.click(
        lambda: [c.update(visible=False) for c in components],
        inputs=[],
        outputs=components
    )


if __name__ == "__main__":
    demo.launch()
