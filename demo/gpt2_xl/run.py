import gradio as gr

title = "gpt2-xl"

examples = [
    ["The tower is 324 metres (1,063 ft) tall,"],
    ["The Moon's orbit around Earth has"],
    ["The smooth Borealis basin in the Northern Hemisphere covers 40%"],
]

demo = gr.load(
    "huggingface/gpt2-xl",
    inputs=gr.Textbox(lines=5, max_lines=6, label="Input Text"),
    title=title,
    examples=examples,
)

if __name__ == "__main__":
    demo.launch()
