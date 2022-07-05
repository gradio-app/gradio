import gradio as gr

with gr.Blocks(title="Styling Examples") as demo:
    with gr.Column():
        txt = gr.Textbox(label="Small Textbox", lines=1).style(
            rounded=False,
            border=False,
            container=False,
        )

        num = gr.Number(label="Number", show_label=False).style(
            rounded=False,
            border=False,
            container=False,
        )
        slider = gr.Slider(label="Slider", show_label=False).style(
            container=False,
        )
        check = gr.Checkbox(label="Checkbox", show_label=False).style(
            rounded=False,
            border=False,
            container=False,
        )
        check_g = gr.CheckboxGroup(
            label="Checkbox Group", choices=["One", "Two", "Three"], show_label=False
        ).style(rounded=False, container=False, item_container=False)
        radio = gr.Radio(
            label="Radio", choices=["One", "Two", "Three"], show_label=False
        ).style(
            item_container=False,
            container=False,
        )
        drop = gr.Dropdown(
            label="Dropdown", choices=["One", "Two", "Three"], show_label=False
        ).style(
            rounded=False,
            border=False,
            container=False,
        )
        image = gr.Image(show_label=False).style(
            rounded=False,
        )
        video = gr.Video(show_label=False).style(
            rounded=False,
        )
        audio = gr.Audio(show_label=False).style(
            rounded=False,
        )
        file = gr.File(show_label=False).style(
            rounded=False,
        )
        df = gr.Dataframe(show_label=False).style(
            rounded=False,
        )

        ts = gr.Timeseries(show_label=False).style(
            rounded=False,
        )
        label = gr.Label().style(
            container=False,
        )
        highlight = gr.HighlightedText(
            "+ hello. - goodbye", show_label=False, color_map={"+": "green", "-": "red"}
        ).style(rounded=False, container=False)
        json = gr.JSON().style(container=False)
        html = gr.HTML(show_label=False).style()
        gallery = gr.Gallery().style(
            rounded=False,
            grid=(3, 3, 1),
            height="auto",
            container=False,
        )
        chat = gr.Chatbot("hi", color_map=("pink", "blue")).style(
            rounded=False,
        )

        model = gr.Model3D().style(
            rounded=False,
        )

        gr.Plot().style()
        md = gr.Markdown(show_label=False).style()

        highlight = gr.HighlightedText().style(
            rounded=False,
        )

        btn = gr.Button("Run").style(
            rounded=False,
            full_width=True,
            border=False,
        )

        # Not currently public
        # TODO: Uncomment at next release
        # gr.Dataset().style(
        #     rounded=False,
        #     margin=False,
        #     border=False,
        # )


if __name__ == "__main__":
    demo.launch()
