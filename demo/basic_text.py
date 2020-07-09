import gradio as gr


def answer_question(quantity, animal, place, activity_list, morning, etc):
    return f"""The {quantity} {animal}s went to the {place} where they {" and ".join(activity_list)} until the {"morning" if morning else "night"}""", "OK"


gr.Interface(answer_question, 
            [
                gr.inputs.Slider(2, 20),
                gr.inputs.Dropdown(["cat", "dog", "bird"]),
                gr.inputs.Radio(["park", "zoo", "road"]),
                gr.inputs.CheckboxGroup(["ran", "swam", "ate", "slept"]),
                gr.inputs.Checkbox(label="Is it the morning?"),
                gr.inputs.Textbox(default="What else?"),
            ], 
            [
                gr.outputs.Textbox(),
                gr.outputs.Textbox(),
            ],
            examples=[
                [2, "cat", "park", ["ran", "swam"], True],
                [4, "dog", "zoo", ["ate", "swam"], False],
                [10, "bird", "road", ["ran"], False],
                [8, "cat", "zoo", ["ate"], True],
            ]
            ).launch()
