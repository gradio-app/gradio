import gradio as gr


with gr.Blocks() as demo:
    gr.Markdown("# Pending Input Components")
    # with gr.Row():

    #     with gr.Column():
    #         file = gr.File()
    #         btn = gr.Button("Upload")
    #     with gr.Column():
    #         output_file = gr.File()
    #         btn.click(
    #             lambda s: (s),
    #             file,
    #             output_file,
    #         )
    # with gr.Row():
    #     with gr.Column():
    #         img = gr.Image(type="filepath")
    #         btn_2 = gr.Button("Upload")
    #     with gr.Column():
    #         output_file_2 = gr.File()
    #         btn_2.click(
    #             lambda s: (s),
    #             img,
    #             output_file_2,
    #         )
    # with gr.Row():
    #     with gr.Column():
    #         audio = gr.Audio(type="filepath")
    #         btn_3 = gr.Button("Upload")
    #     with gr.Column():
    #         output_file_3 = gr.File()
    #         btn_3.click(
    #             lambda s: (s),
    #             audio,
    #             output_file_3,
    #         )
    # with gr.Row():
    #     with gr.Column():
    #         video = gr.Video()
    #         btn_3 = gr.Button("Upload")
    #     with gr.Column():
    #         output_file_4 = gr.File()
    #         btn_3.click(
    #             lambda s: (s),
    #             video,
    #             output_file_4,
    #         )
    # with gr.Row():
    #     with gr.Column():
    #         model3d = gr.Model3D()
    #         btn_4 = gr.Button("Upload")
    #     with gr.Column():
    #         output_file_4 = gr.File()
    #         btn_4.click(
    #             lambda s: (s),
    #             model3d,
    #             output_file_4,
    #         )

    # with gr.Row():
    #     with gr.Column():
    #         gallery = gr.Gallery()
    #         btn_5 = gr.Button("Upload")
    #     with gr.Column():
    #         output_file_5 = gr.File(file_count="multiple")
    #         btn_5.click(
    #             lambda s: [x[0] for x in s],
    #             gallery,
    #             output_file_5,
    #         )
    # with gr.Row():
    #     with gr.Column():
    #         df = gr.Dataframe()
    #         btn_6 = gr.Button("Upload")
    #     with gr.Column():
    #         output_file_6 = gr.File()
    #         btn_6.click(
    #             lambda s: (s),
    #             df,
    #             output_file_6,
    #         )
    # with gr.Row():
    #     with gr.Column():
    #         imageslider = gr.ImageSlider(type="filepath")
    #         btn_7 = gr.Button("Upload")
    #     with gr.Column():
    #         output_file_7 = gr.File()
    #         btn_7.click(
    #             lambda s: s[0],
    #             imageslider,
    #             output_file_7,
    #         )
    with gr.Row():
        with gr.Column():
            text = gr.MultimodalTextbox()
            btn_8 = gr.Button("Upload")
        with gr.Column():
            output_file_8 = gr.File()
            btn_8.click(
                lambda s: s["files"],
                text,
                output_file_8,
            )


if __name__ == "__main__":
    demo.launch(
        allowed_paths=["/private/var/folders/3w/6btg016509v7b2lz9h7vwqv00000gn/T"]
    )
