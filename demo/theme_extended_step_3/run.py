import gradio as gr
import time

with gr.Blocks() as demo:
    textbox = gr.Textbox(label="Name")
    slider = gr.Slider(label="Count", minimum=0, maximum=100, step=1)
    with gr.Row():
        button = gr.Button("Submit", variant="primary")
        clear = gr.Button("Clear")
    output = gr.Textbox(label="Output")

    def repeat(name, count):
        time.sleep(3)
        return name * count

    button.click(repeat, [textbox, slider], output)

if __name__ == "__main__":
    demo.launch(
    theme=gr.themes.Default(
        font=[gr.themes.GoogleFont("Inconsolata"), "Arial", "sans-serif"]
    )
)
