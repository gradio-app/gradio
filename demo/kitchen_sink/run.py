import os
import json

import numpy as np

import gradio as gr

CHOICES = ["foo", "bar", "baz"]
JSONOBJ = """{"items":{"item":[{"id": "0001","type": null,"is_good": false,"ppu": 0.55,"batters":{"batter":[{ "id": "1001", "type": "Regular" },{ "id": "1002", "type": "Chocolate" },{ "id": "1003", "type": "Blueberry" },{ "id": "1004", "type": "Devil's Food" }]},"topping":[{ "id": "5001", "type": "None" },{ "id": "5002", "type": "Glazed" },{ "id": "5005", "type": "Sugar" },{ "id": "5007", "type": "Powdered Sugar" },{ "id": "5006", "type": "Chocolate with Sprinkles" },{ "id": "5003", "type": "Chocolate" },{ "id": "5004", "type": "Maple" }]}]}}"""


def fn(
    text1,
    text2,
    num,
    slider1,
    slider2,
    single_checkbox,
    checkboxes,
    radio,
    dropdown,
    multi_dropdown,
    im1,
    im2,
    im3,
    im4,
    video,
    audio1,
    audio2,
    file,
    df1,
    df2,
):
    return (
        (text1 if single_checkbox else text2)
        + ", selected:"
        + ", ".join(checkboxes),  # Text
        {
            "positive": num / (num + slider1 + slider2),
            "negative": slider1 / (num + slider1 + slider2),
            "neutral": slider2 / (num + slider1 + slider2),
        },  # Label
        (audio1[0], np.flipud(audio1[1]))
        if audio1 is not None
        else os.path.join(os.path.dirname(__file__), "files/cantina.wav"),  # Audio
        np.flipud(im1)
        if im1 is not None
        else os.path.join(os.path.dirname(__file__), "files/cheetah1.jpg"),  # Image
        video
        if video is not None
        else os.path.join(os.path.dirname(__file__), "files/world.mp4"),  # Video
        [
            ("The", "art"),
            ("quick brown", "adj"),
            ("fox", "nn"),
            ("jumped", "vrb"),
            ("testing testing testing", None),
            ("over", "prp"),
            ("the", "art"),
            ("testing", None),
            ("lazy", "adj"),
            ("dogs", "nn"),
            (".", "punc"),
        ]
        + [(f"test {x}", f"test {x}") for x in range(10)],  # HighlightedText
        # [("The testing testing testing", None), ("quick brown", 0.2), ("fox", 1), ("jumped", -1), ("testing testing testing", 0), ("over", 0), ("the", 0), ("testing", 0), ("lazy", 1), ("dogs", 0), (".", 1)] + [(f"test {x}",  x/10) for x in range(-10, 10)],  # HighlightedText
        [
            ("The testing testing testing", None),
            ("over", 0.6),
            ("the", 0.2),
            ("testing", None),
            ("lazy", -0.1),
            ("dogs", 0.4),
            (".", 0),
        ]
        + [(f"test", x / 10) for x in range(-10, 10)],  # HighlightedText
        json.loads(JSONOBJ),  # JSON
        "<button style='background-color: red'>Click Me: "
        + radio
        + "</button>",  # HTML
        os.path.join(os.path.dirname(__file__), "files/titanic.csv"),
        df1,  # Dataframe
        np.random.randint(0, 10, (4, 4)),  # Dataframe
        df2,  # Timeseries
    )


demo = gr.Interface(
    fn,
    inputs=[
        gr.Textbox(value="Lorem ipsum", label="Textbox"),
        gr.Textbox(lines=3, placeholder="Type here..", label="Textbox 2"),
        gr.Number(label="Number", value=42),
        gr.Slider(10, 20, value=15, label="Slider: 10 - 20"),
        gr.Slider(maximum=20, step=0.04, label="Slider: step @ 0.04"),
        gr.Checkbox(label="Checkbox"),
        gr.CheckboxGroup(label="CheckboxGroup", choices=CHOICES, value=CHOICES[0:2]),
        gr.Radio(label="Radio", choices=CHOICES, value=CHOICES[2]),
        gr.Dropdown(label="Dropdown", choices=CHOICES),
        gr.Dropdown(label="Multiselect Dropdown (Max choice: 2)", choices=CHOICES, multiselect=True, max_choices=2),
        gr.Image(label="Image"),
        gr.Image(label="Image w/ Cropper", tool="select"),
        gr.Image(label="Sketchpad", source="canvas"),
        gr.Image(label="Webcam", source="webcam"),
        gr.Video(label="Video"),
        gr.Audio(label="Audio"),
        gr.Audio(label="Microphone", source="microphone"),
        gr.File(label="File"),
        gr.Dataframe(label="Dataframe", headers=["Name", "Age", "Gender"]),
        gr.Timeseries(x="time", y=["price", "value"], colors=["pink", "purple"]),
    ],
    outputs=[
        gr.Textbox(label="Textbox"),
        gr.Label(label="Label"),
        gr.Audio(label="Audio"),
        gr.Image(label="Image"),
        gr.Video(label="Video"),
        gr.HighlightedText(label="HighlightedText").style(
            color_map={"punc": "pink", "test 0": "blue"}
        ),
        gr.HighlightedText(label="HighlightedText", show_legend=True),
        gr.JSON(label="JSON"),
        gr.HTML(label="HTML"),
        gr.File(label="File"),
        gr.Dataframe(label="Dataframe"),
        gr.Dataframe(label="Numpy"),
        gr.Timeseries(x="time", y=["price", "value"], label="Timeseries"),
    ],
    examples=[
        [
            "the quick brown fox",
            "jumps over the lazy dog",
            10,
            12,
            4,
            True,
            ["foo", "baz"],
            "baz",
            "bar",
            ["foo", "bar"],
            os.path.join(os.path.dirname(__file__), "files/cheetah1.jpg"),
            os.path.join(os.path.dirname(__file__), "files/cheetah1.jpg"),
            os.path.join(os.path.dirname(__file__), "files/cheetah1.jpg"),
            os.path.join(os.path.dirname(__file__), "files/cheetah1.jpg"),
            os.path.join(os.path.dirname(__file__), "files/world.mp4"),
            os.path.join(os.path.dirname(__file__), "files/cantina.wav"),
            os.path.join(os.path.dirname(__file__), "files/cantina.wav"),
            os.path.join(os.path.dirname(__file__), "files/titanic.csv"),
            [[1, 2, 3, 4], [4, 5, 6, 7], [8, 9, 1, 2], [3, 4, 5, 6]],
            os.path.join(os.path.dirname(__file__), "files/time.csv"),
        ]
    ]
    * 3,
    title="Kitchen Sink",
    description="Try out all the components!",
    article="Learn more about [Gradio](http://gradio.app)",
    cache_examples=True,
)

if __name__ == "__main__":
    demo.launch()