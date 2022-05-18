import gradio as gr

with gr.Blocks() as demo:
    with gr.Column():
        txt = gr.Textbox(label="Small Textbox", lines=1).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )

        num = gr.Number(label="Number", show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        check = gr.Checkbox(label="Checkbox", show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        check_g = gr.CheckboxGroup(
            label="Checkbox Group", choices=["One", "Two", "Three"], show_label=False
        ).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        radio = gr.Radio(
            label="Radio", choices=["One", "Two", "Three"], show_label=False
        ).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        drop = gr.Dropdown(
            label="Dropdown", choices=["One", "Two", "Three"], show_label=False
        ).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        slider = gr.Slider(label="Slider", show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        audio = gr.Audio(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        file = gr.File(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        video = gr.Video(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        image = gr.Image(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        ts = gr.Timeseries(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        df = gr.Dataframe(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        html = gr.HTML(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        json = gr.JSON(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        md = gr.Markdown(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        label = gr.Label(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        highlight = gr.HighlightedText(show_label=False).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        gr.Dataframe(interactive=True, col_count=(3, "fixed")).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )
        gr.Dataframe(interactive=True, col_count=4).style(
            rounded=False,
            bg_color="green",
            text_color="blue",
            container_bg_color="red",
            margin=False,
            border=False,
        )


if __name__ == "__main__":
    demo.launch()
