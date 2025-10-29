import numpy as np
import pandas as pd
import gradio as gr

def transpose(matrix):
    return matrix.T

demo = gr.Interface(
    transpose,
    gr.Dataframe(type="numpy", datatype="number", row_count=5, col_count=3, show_fullscreen_button=True, value=pd.DataFrame(np.zeros((5, 5), dtype=int), columns=pd.Index([str(i) for i in range(5)]))
),
    "numpy",
    # examples=[
    #     [np.zeros((30, 30)).tolist()],
    #     [np.ones((2, 2)).tolist()],
    #     [np.random.randint(0, 10, (3, 10)).tolist()],
    #     [np.random.randint(0, 10, (10, 3)).tolist()],
    #     [np.random.randint(0, 10, (10, 10)).tolist()],
    # ],
    cache_examples=False
)

if __name__ == "__main__":
    demo.launch()
