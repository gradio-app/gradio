# Default theme demo
import gradio as gr

with gr.Blocks(theme=gr.themes.Default()) as demo:
    with gr.Tabs():
        with gr.Tab("Simple Inputs"):
            with gr.Row():
                with gr.Column():
                    gr.Textbox(interactive=True)
                    gr.Radio(choices=["a", "b", "c"], interactive=True)
                    gr.Checkbox(interactive=True)
                with gr.Column():
                    with gr.Box():
                        gr.Number(interactive=True)
                        gr.CheckboxGroup(choices=["one", "two", "three"], interactive=True)
                        gr.Dropdown(choices=["d", "e", "f"], interactive=True)
                with gr.Column():
                    gr.Slider(minimum=0, maximum=10, interactive=True)
                    gr.Button(variant="primary")


if __name__ == "__main__":
    demo.launch()
