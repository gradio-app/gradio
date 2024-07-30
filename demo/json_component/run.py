import gradio as gr
import numpy as np

with gr.Blocks() as demo:
    inp = gr.JSON(
        label="InputJSON",
        value={
            "Key 1": "Value 1",
            "Key 2": {"Key 3": "Value 2", "Key 4": "Value 3"},
            "Key 5": ["Item 1", "Item 2", "Item 3"],
            "Key 6": 123,
            "Key 7": 123.456,
            "Key 8": True,
            "Key 9": False,
            "Key 10": None,
            "Key 11": np.array([1, 2, 3]),
        }
    )
    out = gr.JSON(label="OutputJSON")
    btn = gr.Button("Submit")
    btn.click(lambda x: x, inp, out)

if __name__ == "__main__":
    demo.launch()
