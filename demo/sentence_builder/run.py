import gradio as gr


def sentence_builder(quantity, animal, countries, place, activity_list, morning):
    return f"""The {quantity} {animal}s from {" and ".join(countries)} went to the {place} where they {" and ".join(activity_list)} until the {"morning" if morning else "night"}"""


demo = gr.Interface(
    sentence_builder,
    [
        gr.Slider(2, 20, value=4, label="Count", info="Choose between 2 and 20"),
        gr.Dropdown(
            ["cat", "dog", "bird"], label="Animal", info="Will add more animals later!"
        ),
        gr.CheckboxGroup(["USA", "Japan", "Pakistan"], label="Countries", info="Where are they from?"),
        gr.Radio(["park", "zoo", "road"], label="Location", info="Where did they go?"),
        gr.Dropdown(
            ["ran", "swam", "ate", "slept"], value=["swam", "slept"], multiselect=True, label="Activity", info="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc vel nisl."
        ),
        gr.Checkbox(label="Morning", info="Did they do it in the morning?"),
    ],
    "text",
    examples=[
        [2, "cat", ["Japan", "Pakistan"], "park", ["ate", "swam"], True],
        [4, "dog", ["Japan"], "zoo", ["ate", "swam"], False],
        [10, "bird", ["USA", "Pakistan"], "road", ["ran"], False],
        [8, "cat", ["Pakistan"], "zoo", ["ate"], True],
    ]
)

if __name__ == "__main__":
    demo.launch()
