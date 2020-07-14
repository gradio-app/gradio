import gradio as gr
import numpy as np

def answer_question(quantity, animal, place, activity_list, morning, etc, im1, im2):
    return f"""The {quantity} {animal}s went to the {place} where they {" and ".join(activity_list)} until the {"morning" if morning else "night"}""", np.flipud(im2)


gr.Interface(answer_question, 
            [
                gr.inputs.Slider(2, 20),
                gr.inputs.Dropdown(["cat", "dog", "bird"]),
                gr.inputs.Radio(["park", "zoo", "road"]),
                gr.inputs.CheckboxGroup(["ran", "swam", "ate", "slept"]),
                gr.inputs.Checkbox(label="Is it the morning?"),
                gr.inputs.Textbox(default="What else?"),
                gr.inputs.Sketchpad(shape=(100,100)),
                gr.inputs.Image(shape=(100,100)),
            ], 
            [
                gr.outputs.Textbox(),
                gr.outputs.Image()                
            ],
            examples=[
                [2, "cat", "park", ["ran", "swam"], True, "t1"],
                [4, "dog", "zoo", ["ate", "swam"], False, "t2"],
                [10, "bird", "road", ["ran"], False, "t3"],
                [8, "cat", "zoo", ["ate"], True, "t1"],
            ],
            title="Test for all Interfaces",
            description="Here's an example that uses almost all the interface types, so give it a try! Let's hope it works :D"
            ).launch()
