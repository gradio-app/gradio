import matplotlib.pyplot as plt

import gradio as gr
from gradio.media import get_image


def validate_text(value: str):
    return gr.validate(bool(value.strip()), "Text is required")


def echo(value: str):
    return value


figure, axis = plt.subplots()
axis.plot([0, 1, 2], [0, 1, 0])


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column(variant="panel", elem_id="panel-column"):
            gr.Markdown("Panel column")
        with gr.Column(variant="compact", elem_id="compact-column"):
            gr.Button("Compact one")
            gr.Button("Compact two")

    with gr.Row():
        gr.HTML(
            "Padded HTML",
            container=True,
            padding=True,
            elem_id="padded-html",
        )
        gr.HTML(
            "Unpadded HTML",
            container=True,
            padding=False,
            elem_id="unpadded-html",
        )

    gr.JSON({"shared": "theme"}, elem_id="shared-json")
    gr.Plot(figure, elem_id="shared-plot")

    with gr.Tabs():
        with gr.Tab("Scaled tab", scale=2, elem_id="scaled-tab"):
            gr.Markdown("Scaled tab content")
        with gr.Tab("Other tab"):
            gr.Markdown("Other tab content")

    image_component = gr.Image(visible=False)
    gr.Dataset(
        components=[image_component],
        samples=[[get_image("cheetah1.jpg")]],
        label="Image examples",
        elem_id="shared-dataset",
    )

    validated_text = gr.Textbox(label="Validated text")
    validate_button = gr.Button("Validate text")
    validated_output = gr.Textbox(label="Validated output", interactive=False)
    validate_button.click(
        echo,
        validated_text,
        validated_output,
        validator=validate_text,
    )


if __name__ == "__main__":
    demo.launch()
