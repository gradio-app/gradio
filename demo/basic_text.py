import gradio as gr
from time import sleep

def answer_question(quantity, animal, place, activity_list, morning):
    return f"""The {quantity} {animal}s went to the {place} where they {" and ".join(activity_list)} until the {"morning" if morning else "night"}"""


gr.Interface(answer_question, 
            [
                gr.inputs.Slider(2, 20),
                gr.inputs.Dropdown(["cat", "dog", "bird"]),
                gr.inputs.Radio(["park", "zoo", "road"]),
                gr.inputs.CheckboxGroup(["ran", "swam", "ate", "slept"]),
                gr.inputs.Checkbox(label="Is it the morning?"),
            ], 
            gr.outputs.Textbox(label="out", lines=8),
            examples=[
                [2, "cat", "park", ["ran", "swam"], True],
                [4, "dog", "zoo", ["ate", "swam"], False],
                [10, "bird", "road", ["ran"], False],
                [8, "cat", "zoo", ["ate"], True],
            ]
            ).launch()
