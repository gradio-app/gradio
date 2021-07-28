import gradio as gr
import pandas as pd
import random

def fraud_detector(card_activity, categories, sensitivity):
    activity_range = random.randint(0, 100)
    return {"fraud": activity_range / 100., "not fraud": 1 - activity_range / 100.}

iface = gr.Interface(fraud_detector, 
    [
        gr.inputs.Timeseries(
            x="time",
           y=["retail", "food", "other"]
        ),
        gr.inputs.CheckboxGroup(["retail", "food", "other"], default=["retail", "food", "other"]),
        gr.inputs.Slider(1,3)
    ],
    [
        gr.outputs.Label(label="Fraud Level"), 
    ]
)
if __name__ == "__main__":
    iface.launch()
