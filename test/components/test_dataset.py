from pathlib import Path
from unittest.mock import patch

import numpy as np
import pandas as pd

import gradio as gr


class TestDataset:
    def test_preprocessing(self):
        test_file_dir = Path(__file__).parent / "test_files"
        bus = str(Path(test_file_dir, "bus.png").resolve())

        dataset = gr.Dataset(
            components=["number", "textbox", "image", "html", "markdown"],
            samples=[
                [5, "hello", bus, "<b>Bold</b>", "**Bold**"],
                [15, "hi", bus, "<i>Italics</i>", "*Italics*"],
            ],
        )

        row = dataset.preprocess(1)
        assert isinstance(row, list)
        assert row[0] == 15
        assert row[1] == "hi"
        assert row[2].endswith("bus.png")
        assert row[3] == "<i>Italics</i>"
        assert row[4] == "*Italics*"

        dataset = gr.Dataset(
            components=["number", "textbox", "image", "html", "markdown"],
            samples=[
                [5, "hello", bus, "<b>Bold</b>", "**Bold**"],
                [15, "hi", bus, "<i>Italics</i>", "*Italics*"],
            ],
            type="index",
        )

        assert dataset.preprocess(1) == 1

        radio = gr.Radio(choices=[("name 1", "value 1"), ("name 2", "value 2")])
        dataset = gr.Dataset(samples=[["value 1"], ["value 2"]], components=[radio])
        assert dataset.samples == [["value 1"], ["value 2"]]

    def test_postprocessing(self):
        dataset = gr.Dataset(
            components=["number", "textbox", "image", "html", "markdown"], type="index"
        )
        assert dataset.postprocess(1) == 1


@patch(
    "gradio.components.Component.process_example",
    spec=gr.components.Component.process_example,
)
@patch("gradio.components.Image.process_example", spec=gr.Image.process_example)
@patch("gradio.components.File.process_example", spec=gr.File.process_example)
@patch("gradio.components.Dataframe.process_example", spec=gr.DataFrame.process_example)
@patch("gradio.components.Model3D.process_example", spec=gr.Model3D.process_example)
def test_dataset_calls_process_example(*mocks):
    gr.Dataset(
        components=[gr.Dataframe(), gr.File(), gr.Image(), gr.Model3D(), gr.Textbox()],
        samples=[
            [
                pd.DataFrame({"a": np.array([1, 2, 3])}),
                "foo.png",
                "bar.jpeg",
                "duck.obj",
                "hello",
            ]
        ],
    )
    assert all(m.called for m in mocks)
