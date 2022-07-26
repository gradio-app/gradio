import gradio as gr
import pandas as pd

demo = gr.Interface(
    fn=lambda: [["x1", "y1"], ["x2", "y2"], ["x3", "y3"]],
    inputs=None,
    outputs=gr.DataFrame(
        col_count=2,
        row_count=3,
        type="array",
        headers=["A", "B"],
        interactive=False,
    ),
)

if __name__ == "__main__":
    demo.launch(debug=True)
