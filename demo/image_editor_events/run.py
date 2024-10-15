import gradio as gr
from dataclasses import dataclass


@dataclass
class State:
    apply: int = 0
    change: int = 0
    input: int = 0
    upload: int = 0


def update_event(state, event):
    setattr(state, event, getattr(state, event) + 1)
    return state, getattr(state, event)


def predict(im):
    return im["composite"]


with gr.Blocks() as demo:
    with gr.Group():
        with gr.Row():
            im = gr.ImageEditor(
                type="numpy",
                crop_size="1:1",
                elem_id="image_editor",
            )
            im_preview = gr.Image()
    with gr.Group():
        with gr.Row():
            state = gr.State(State())

            n_upload = gr.Label(
                0,
                label="upload",
                elem_id="upload",
            )
            n_change = gr.Label(
                0,
                label="change",
                elem_id="change",
            )
            n_input = gr.Label(
                0,
                label="input",
                elem_id="input",
            )
            n_apply = gr.Label(
                0,
                label="apply",
                elem_id="apply",
            )
    clear_btn = gr.Button("Clear", elem_id="clear")

    im.upload(
        lambda x: update_event(x, "upload"),
        outputs=[state, n_upload],
        inputs=state,
        show_progress="hidden",
    )
    im.change(
        lambda x: update_event(x, "change"),
        outputs=[state, n_change],
        inputs=state,
        show_progress="hidden",
    )
    im.input(
        lambda x: update_event(x, "input"),
        outputs=[state, n_input],
        inputs=state,
        show_progress="hidden",
    )
    im.apply(
        lambda x: update_event(x, "apply"),
        outputs=[state, n_apply],
        inputs=state,
        show_progress="hidden",
    )
    im.change(predict, outputs=im_preview, inputs=im, show_progress="hidden")
    clear_btn.click(
        lambda: None,
        None,
        im,
    )

if __name__ == "__main__":
    demo.launch()
