# import gradio as gr
# import os


# def flip(i):
#     return i.rotate(180)


# with gr.Blocks() as demo:
#     with gr.Row():
#         with gr.Column():
#             img_i = gr.Image(
#                 label="Input Image",
#                 type="pil",
#                 value=os.path.join(os.path.dirname(__file__), "images/cheetah1.jpg"),
#             )
#         with gr.Column():
#             img_o = gr.Image(label="Output Image")
#     with gr.Row():
#         btn = gr.Button(value="Flip Image")
#     btn.click(flip, inputs=[img_i], outputs=[img_o])

#     gr.Examples(
#         [
#             os.path.join(os.path.dirname(__file__), "images/cheetah1.jpg"),
#             os.path.join(os.path.dirname(__file__), "images/lion.jpg"),
#         ],
#         img_i,
#         img_o,
#         flip,
#     )

# demo.launch()


import gradio as gr
import os


def flip(*imgs):
    return [i.rotate(180) for i in imgs]


def make_colors(im1, im2):
    return [gr.Image(im1, elem_classes=["blue"]), gr.Image(im2, elem_classes=["pink"])]


with gr.Blocks(
    css=".pink > div {border: 20px solid pink;} .blue > div {border: 20px solid blue}"
) as demo:
    with gr.Group():
        with gr.Row():
            img_i_1 = gr.Image(
                label="Pink Image",
                type="pil",
                value=os.path.join(os.path.dirname(__file__), "images/cheetah1.jpg"),
                elem_classes=["pink"],
            )
            img_i_2 = gr.Image(
                label="Blue Image",
                type="pil",
                value=os.path.join(os.path.dirname(__file__), "images/lion.jpg"),
                elem_classes=["blue"],
            )

    with gr.Group():
        with gr.Row():
            img_o_1 = gr.Image(label="Output Image")
            img_o_2 = gr.Image(label="Output Image")
    with gr.Group():
        with gr.Row():
            btn = gr.Button(value="Flip Image")
            class_btn = gr.Button(value="Make Colors")

    btn.click(flip, inputs=[img_i_1, img_i_2], outputs=[img_o_1, img_o_2])
    class_btn.click(make_colors, inputs=[img_i_1, img_i_2], outputs=[img_i_1, img_i_2])

    gr.Examples(
        [
            [
                os.path.join(os.path.dirname(__file__), "images/cheetah1.jpg"),
                os.path.join(os.path.dirname(__file__), "images/cheetah1.jpg"),
            ],
            [
                os.path.join(os.path.dirname(__file__), "images/lion.jpg"),
                os.path.join(os.path.dirname(__file__), "images/lion.jpg"),
            ],
        ],
        [img_i_1, img_i_2],
        [img_o_1, img_o_2],
        flip,
    )

demo.launch()
