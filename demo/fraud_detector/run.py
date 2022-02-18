import random

import pandas as pd

import gradio as gr


def fraud_detector(card_activity, categories, sensitivity):
    activity_range = random.randint(0, 100)
    drop_columns = [
        column for column in ["retail", "food", "other"] if column not in categories
    ]
    if len(drop_columns):
        card_activity.drop(columns=drop_columns, inplace=True)
    return (
        card_activity,
        card_activity,
        {"fraud": activity_range / 100.0, "not fraud": 1 - activity_range / 100.0},
    )


iface = gr.Interface(
    fraud_detector,
    [
        gr.inputs.Timeseries(x="time", y=["retail", "food", "other"]),
        gr.inputs.CheckboxGroup(
            ["retail", "food", "other"], default=["retail", "food", "other"]
        ),
        gr.inputs.Slider(1, 3),
    ],
    [
        "dataframe",
        gr.outputs.Timeseries(x="time", y=["retail", "food", "other"]),
        gr.outputs.Label(label="Fraud Level"),
    ],
)
if __name__ == "__main__":
    iface.launch()
