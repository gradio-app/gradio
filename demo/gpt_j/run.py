import gradio as gr

title = "GPT-J-6B"

examples = [
    ["The tower is 324 metres (1,063 ft) tall,"],
    ["The Moon's orbit around Earth has"],
    ["The smooth Borealis basin in the Northern Hemisphere covers 40%"],
]

gr.Interface.load(
    "huggingface/EleutherAI/gpt-j-6B",
    inputs=gr.inputs.Textbox(lines=5, label="Input Text"),
    title=title,
    examples=examples,
).launch()
