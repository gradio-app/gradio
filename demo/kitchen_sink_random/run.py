import gradio as gr
from datetime import datetime
import random

demo = gr.Interface(lambda x: x,
                    inputs=[gr.Textbox(value=lambda: datetime.now(), label="Current Time"),
                            gr.Number(value=lambda: random.random(), label="Ranom Percentage"),
                            gr.Checkbox(value=lambda: random.random() > 0.5, label="Random Checkbox"),
                            gr.CheckboxGroup(choices=["a", "b", "c", "d"],
                                             value=lambda: random.choice(["a", "b", "c", "d"]),
                                             label="Random CheckboxGroup"),
                            gr.Slider(minimum=-1, maximum=1, randomize=True, label="Slider with randomize"),
                            gr.Slider(minimum=0, maximum=1, value=lambda: random.random(), label="Slider with value func"),

                                        ],
                    outputs=None)

if __name__ == "__main__":
    demo.launch()
