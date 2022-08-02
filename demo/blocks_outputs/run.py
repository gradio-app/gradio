import gradio as gr


def make_markdown():
    return [
        [
            "# hello again",
            "Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
            '<img src="https://images.unsplash.com/photo-1574613362884-f79513a5128c?fit=crop&w=500&q=80"/>',
        ],
        [
            "## hello again again",
            "Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
            '<img src="https://images.unsplash.com/photo-1574613362884-f79513a5128c?fit=crop&w=500&q=80"/>',
        ],
        [
            "### hello thrice",
            "Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
            '<img src="https://images.unsplash.com/photo-1574613362884-f79513a5128c?fit=crop&w=500&q=80"/>',
        ],
    ]


with gr.Blocks() as demo:
    with gr.Column():
        txt = gr.Textbox(label="Small Textbox", lines=1, show_label=False)
        txt = gr.Textbox(label="Large Textbox", lines=5, show_label=False)
        num = gr.Number(label="Number", show_label=False)
        check = gr.Checkbox(label="Checkbox", show_label=False)
        check_g = gr.CheckboxGroup(
            label="Checkbox Group", choices=["One", "Two", "Three"], show_label=False
        )
        radio = gr.Radio(
            label="Radio", choices=["One", "Two", "Three"], show_label=False
        )
        drop = gr.Dropdown(
            label="Dropdown", choices=["One", "Two", "Three"], show_label=False
        )
        slider = gr.Slider(label="Slider", show_label=False)
        audio = gr.Audio(show_label=False)
        file = gr.File(show_label=False)
        video = gr.Video(show_label=False)
        image = gr.Image(show_label=False)
        ts = gr.Timeseries(show_label=False)
        df = gr.Dataframe(show_label=False)
        html = gr.HTML(show_label=False)
        json = gr.JSON(show_label=False)
        md = gr.Markdown(show_label=False)
        label = gr.Label(show_label=False)
        highlight = gr.HighlightedText(show_label=False)
        gr.Dataframe(interactive=True, col_count=(3, "fixed"), label="Dataframe")
        gr.Dataframe(interactive=True, col_count=4, label="Dataframe")
        gr.Dataframe(
            interactive=True, headers=["One", "Two", "Three", "Four"], label="Dataframe"
        )
        gr.Dataframe(
            interactive=True,
            headers=["One", "Two", "Three", "Four"],
            col_count=(4, "fixed"),
            row_count=(7, "fixed"),
            value=[[0, 0, 0, 0]],
            label="Dataframe",
        )
        gr.Dataframe(
            interactive=True, headers=["One", "Two", "Three", "Four"], col_count=4
        )
        df = gr.DataFrame(
            [
                [
                    "# hello",
                    "Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
                    '<img src="https://images.unsplash.com/photo-1574613362884-f79513a5128c?fit=crop&w=500&q=80"/>',
                ],
                [
                    "## hello",
                    "Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
                    '<img src="https://images.unsplash.com/photo-1574613362884-f79513a5128c?fit=crop&w=500&q=80"/>',
                ],
                [
                    "### hello",
                    "Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
                    '<img src="https://images.unsplash.com/photo-1574613362884-f79513a5128c?fit=crop&w=500&q=80"/>',
                ],
            ],
            headers=["One", "Two", "Three"],
            wrap=True,
            datatype=["markdown", "markdown", "html"],
            interactive=True,
        )
        btn = gr.Button("Run")
        btn.click(fn=make_markdown, inputs=None, outputs=df)


if __name__ == "__main__":
    demo.launch()
