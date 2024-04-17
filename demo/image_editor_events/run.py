# import gradio as gr


# def predict(im):
#     return im["composite"]


# with gr.Blocks() as demo:
#     with gr.Group():
#         with gr.Row():
#             im = gr.ImageEditor(
#                 type="numpy",
#                 crop_size="1:1",
#                 elem_id="image_editor",
#             )
#             im_preview = gr.Image()
#     with gr.Group():
#         with gr.Row():

#             n_upload = gr.Label(
#                 0,
#                 label="upload",
#                 elem_id="upload",
#             )
#             n_change = gr.Label(
#                 0,
#                 label="change",
#                 elem_id="change",
#             )
#             n_input = gr.Label(
#                 0,
#                 label="input",
#                 elem_id="input",
#             )
#             n_apply = gr.Label(
#                 0,
#                 label="apply",
#                 elem_id="apply",
#             )
#     clear_btn = gr.Button("Clear", elem_id="clear")

#     im.upload(
#         lambda x: int(x) + 1, outputs=n_upload, inputs=n_upload, show_progress="hidden"
#     )
#     im.change(
#         lambda x: int(x) + 1, outputs=n_change, inputs=n_change, show_progress="hidden"
#     )
#     im.input(
#         lambda x: int(x) + 1, outputs=n_input, inputs=n_input, show_progress="hidden"
#     )
#     im.apply(
#         lambda x: int(x) + 1, outputs=n_apply, inputs=n_apply, show_progress="hidden"
#     )
#     im.change(predict, outputs=im_preview, inputs=im, show_progress="hidden")
#     clear_btn.click(
#         lambda: None,
#         None,
#         im,
#     )

# if __name__ == "__main__":
#     demo.launch()


import gradio as gr
import time
from pathlib import Path

dir_ = Path(__file__).parent


def sleep(im):
    time.sleep(5)
    return [im["background"], im["layers"][0], im["layers"][1], im["composite"]]


def predict(im):
    return im


with gr.Blocks() as demo:
    with gr.Row():
        im = gr.ImageEditor(
            type="numpy",
            crop_size="1:1",
            interactive=True,
        )
        im_preview = gr.ImageEditor(interactive=True)

    set_background = gr.Button("Set Background")
    set_background.click(
        lambda: {
            "background": str(dir_ / "cheetah.jpg"),
            "layers": None,
            "composite": None,
        },
        None,
        im,
    )
    set_layers = gr.Button("Set Layers")
    set_layers.click(
        lambda: {
            "background": str(dir_ / "cheetah.jpg"),
            "layers": [
                "https://upload.wikimedia.org/wikipedia/commons/0/09/TheCheethcat.jpg",
                "https://images.theconversation.com/files/375893/original/file-20201218-13-a8h8uq.jpg?ixlib=rb-1.1.0&rect=16%2C407%2C5515%2C2924&q=45&auto=format&w=496&fit=clip",
            ],
            "composite": None,
        },
        None,
        im,
    )
    set_composite = gr.Button("Set Composite")
    set_composite.click(
        lambda: {
            "background": None,
            "layers": None,
            "composite": "https://nationalzoo.si.edu/sites/default/files/animals/cheetah-003.jpg",
        },
        None,
        im,
    )

    im.change(predict, outputs=im_preview, inputs=im, show_progress="hidden")


if __name__ == "__main__":
    demo.launch()
