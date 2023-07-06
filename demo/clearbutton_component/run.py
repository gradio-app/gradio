import gradio as gr

css = (
    "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"
)

with gr.Blocks(css=css) as demo:
    textbox = gr.Textbox(value="This is some text")
    gr.ClearButton(textbox)

if __name__ == "__main__":
    demo.launch()
