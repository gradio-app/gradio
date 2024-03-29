import gradio as gr

with gr.Blocks(title="Styling Examples") as demo:
    with gr.Column(variant="box"):
        txt = gr.Textbox(label="Small Textbox", lines=1)
        num = gr.Number(label="Number", show_label=False)
        slider = gr.Slider(label="Slider", show_label=False)
        check = gr.Checkbox(label="Checkbox", show_label=False)
        check_g = gr.CheckboxGroup(
            label="Checkbox Group",
            choices=["One", "Two", "Three"],
            show_label=False,
        )
        radio = gr.Radio(
            label="Radio",
            choices=["One", "Two", "Three"],
            show_label=False,
        )
        drop = gr.Dropdown(
            label="Dropdown", choices=["One", "Two", "Three"], show_label=False
        )
        image = gr.Image(show_label=False)
        video = gr.Video(show_label=False)
        audio = gr.Audio(show_label=False)
        file = gr.File(show_label=False)
        df = gr.Dataframe(show_label=False)
        label = gr.Label(container=False)
        highlight = gr.HighlightedText(
            [("hello", None), ("goodbye", "-")],
            color_map={"+": "green", "-": "red"},
            container=False,
        )
        json = gr.JSON(container=False)
        html = gr.HTML(show_label=False)
        gallery = gr.Gallery(
            columns=(3, 3, 1),
            height="auto",
            container=False,
        )
        chat = gr.Chatbot([("hi", "good bye")])

        model = gr.Model3D()

        md = gr.Markdown(show_label=False)

        highlight = gr.HighlightedText()

        btn = gr.Button("Run")

        gr.Dataset(components=[txt, num])


if __name__ == "__main__":
    demo.launch()
