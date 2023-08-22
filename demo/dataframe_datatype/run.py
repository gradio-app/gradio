import gradio as gr
import pandas as pd
import numpy as np


def make_dataframe(n_periods):
    return pd.DataFrame({"date_1": pd.date_range("2021-01-01", periods=n_periods),
                         "date_2": pd.date_range("2022-02-15", periods=n_periods).strftime('%B %d, %Y, %r'),
                         "number": np.random.random(n_periods).astype(np.float64),
                         "number_2": np.random.randint(0, 100, n_periods).astype(np.int32),
                         "bool": [True] * n_periods,
                         "markdown": ["# Hello"] * n_periods})


demo = gr.Interface(make_dataframe,
             gr.Number(precision=0),
             gr.Dataframe(datatype=["date", "date", "number", "number", "bool", "markdown"]))


if __name__ == "__main__":
    demo.launch()