# Demo: (Dataframe) -> (Dataframe)

import gradio as gr
import numpy as np
import random

def transpose(matrix):
    return matrix.T

gr.Interface(transpose, 
  gr.inputs.Dataframe(type="numpy", datatype="number", row_count=5, col_count=3), 
  "numpy"
).launch()
