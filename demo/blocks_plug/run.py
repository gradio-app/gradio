import gradio as gr

import gradio as gr
import pandas as pd
import numpy as np


def return_empty(x):
    return np.atleast_1d(x.astype(float).mean(axis=0))


demo = gr.Interface(
    return_empty,
    gr.Dataframe(type="numpy", headers=["a"]),
    gr.Dataframe(headers=["mean"]),
).launch()

if __name__ == "__main__":
    demo.launch()
