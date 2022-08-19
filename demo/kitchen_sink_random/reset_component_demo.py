import gradio as gr
from run import demo


no_reset = [gr.Button, gr.Variable]

components = [c for c in demo.input_components if c.__class__ not in no_reset]

with gr.Blocks() as reset_demo:
    for component in components:
        component.render()
    reset = gr.Button(value="Reset")
    reset.click(lambda: [c.update(value=None) for c in components],
                inputs=[], outputs=components)


if __name__ == "__main__":
    reset_demo.launch()
