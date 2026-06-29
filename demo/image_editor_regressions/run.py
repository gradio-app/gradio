import gradio as gr
import numpy as np


def make_image():
    image = np.zeros((240, 360, 3), dtype=np.uint8)
    image[:, :] = [246, 242, 235]
    image[35:205, 40:320] = [74, 143, 159]
    yy, xx = np.ogrid[:240, :360]
    mask = (xx - 180) ** 2 + (yy - 120) ** 2 <= 65**2
    image[mask] = [255, 209, 102]
    for offset in range(-4, 4):
        y = (215 - (xx - 55) * 175 / 275 + offset).astype(int)
        valid = (y >= 0) & (y < 240)
        image[y[valid], xx[valid]] = [31, 41, 51]
    return image


def hide_column():
    return gr.update(visible=False)


def show_column():
    return gr.update(visible=True)


with gr.Blocks() as demo:
    gr.Markdown("# ImageEditor regressions")

    load_no_sources = gr.Button("Load no-source image")
    no_sources_editor = gr.ImageEditor(
        label="No sources editor",
        type="numpy",
        sources=[],
        interactive=True,
        transforms=["crop", "resize"],
        elem_id="no-sources-editor",
        height=420,
    )
    load_no_sources.click(make_image, outputs=no_sources_editor)

    with gr.Row():
        hide_button = gr.Button("Hide editor column")
        show_button = gr.Button("Show editor column")

    with gr.Column(visible=True, elem_id="toggle-editor-column") as editor_column:
        gr.ImageEditor(
            value=make_image(),
            label="Toggle editor",
            type="numpy",
            transforms=None,
            interactive=True,
            elem_id="toggle-editor",
            height=420,
        )

    hide_button.click(hide_column, outputs=editor_column)
    show_button.click(show_column, outputs=editor_column)


if __name__ == "__main__":
    demo.launch()
