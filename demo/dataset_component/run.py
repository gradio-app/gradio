import gradio as gr

with gr.Blocks() as demo:
    gr.Dataset(components=[gr.Textbox(visible=False)],
        label="Text Dataset",
        samples=[
            ["The quick brown fox jumps over the lazy dog"],
            ["Build & share delightful machine learning apps"],
            ["She sells seashells by the seashore"],
            ["Supercalifragilisticexpialidocious"],
            ["Lorem ipsum"],
            ["That's all folks!"]
        ],
    )
demo.launch()
