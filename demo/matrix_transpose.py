# Demo: (Dataframe) -> (Dataframe)

import gradio as gr
import numpy as np

def transpose(matrix):
    return matrix.T


io = gr.Interface(
    transpose,
    gr.inputs.Dataframe(type="numpy", datatype="number", row_count=5, col_count=3),
    "numpy",
    examples=[
        [np.zeros((3,3)).tolist()],
        [np.ones((2,2)).tolist()],
        [np.random.randint(0, 10, (3,10)).tolist()],
        [np.random.randint(0, 10, (10,3)).tolist()],
        [np.random.randint(0, 10, (10,10)).tolist()],
    ]
)

io.test_launch()

if __name__ == "__main__":
    io.launch()
