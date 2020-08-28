# Demo: (Dataframe, Dropdown) -> (Dataframe)

import gradio as gr
import numpy as np
import random

def filter_records(records, gender):
    return records[records['gender'] == gender]

io = gr.Interface(filter_records,
  [
    gr.inputs.Dataframe(headers=["name", "age", "gender"], datatype=["str", "number", "str"], row_count=5), 
    gr.inputs.Dropdown(["M", "F", "O"])
  ],
  "dataframe",
  description="Enter gender as 'M', 'F', or 'O' for other."
)

io.test_launch()
io.launch()
