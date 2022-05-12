import random

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


demo = gr.Interface(
    fraud_detector,
    [
        gr.Timeseries(x="time", y=["retail", "food", "other"]),
        gr.CheckboxGroup(
            ["retail", "food", "other"], value=["retail", "food", "other"]
        ),
        gr.Slider(minimum=1, maximum=3),
    ],
    [
        "dataframe",
        gr.Timeseries(x="time", y=["retail", "food", "other"]),
        gr.Label(label="Fraud Level"),
    ],
)
if __name__ == "__main__":
    demo.launch()
