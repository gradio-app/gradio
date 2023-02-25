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

if __name__ == "__main__":
    demo.launch()
