import gradio as gr

title = "GPT-J-6B"

examples = [
    ["The tower is 324 metres (1,063 ft) tall,"],
    ["The Moon's orbit around Earth has"],
    ["The smooth Borealis basin in the Northern Hemisphere covers 40%"],
]

demo = gr.Interface.load(
    "huggingface/EleutherAI/gpt-j-6B",
    inputs=gr.Textbox(lines=5, max_lines=6, label="Input Text"),
    title=title,
    examples=examples,
)

if __name__ == "__main__":
    demo.launch()
