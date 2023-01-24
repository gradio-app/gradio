import gradio as gr

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

with gr.Blocks(css=css) as demo:
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