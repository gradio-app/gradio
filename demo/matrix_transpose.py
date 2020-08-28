# Demo: (Dataframe) -> (Dataframe)

import gradio as gr


def transpose(matrix):
    return matrix.T


io = gr.Interface(
    transpose,
    gr.inputs.Dataframe(type="numpy", datatype="number", row_count=5, col_count=3),
    "numpy"
)

io.test_launch()
io.launch()
