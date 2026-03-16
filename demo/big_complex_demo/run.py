import gradio as gr

with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.Tab("Components", id="components"):
            with gr.Row():
                with gr.Column():
                    gr.Textbox(label="Textbox")
                    gr.Number(label="Number")
                    gr.Slider(minimum=0, maximum=100, label="Slider")
                    gr.Dropdown(choices=["A", "B", "C"], label="Dropdown")
                    gr.Radio(choices=["X", "Y", "Z"], label="Radio")
                    gr.Checkbox(label="Checkbox")
                    gr.CheckboxGroup(
                        choices=["1", "2", "3"], label="CheckboxGroup"
                    )
                    gr.ColorPicker(label="ColorPicker")
                with gr.Column():
                    gr.Image(label="Image")
                    gr.Audio(label="Audio")
                    gr.Video(label="Video")
                    gr.File(label="File")
                    gr.Gallery(label="Gallery")
                    gr.Dataframe(label="Dataframe", headers=["A", "B", "C"])
                    gr.JSON(label="JSON", value={"key": "value"})
                    gr.Code(label="Code", language="python")

        with gr.Tab("Chatbot", id="chatbot"):
            gr.Chatbot(
                label="Chatbot",
                value=[
                    {"role": "user", "content": "Hello"},
                    {"role": "assistant", "content": "Hi there!"},
                ],
            )
            gr.Textbox(label="Message")

        with gr.Tab("Media", id="media"):
            with gr.Row():
                gr.Image(label="Image Upload")
                gr.Image(label="Image Output")
            gr.Audio(label="Audio Player")
            gr.Video(label="Video Player")

        with gr.Tab("Layout", id="layout"):
            with gr.Accordion("Accordion 1", open=True):
                gr.Markdown("## Content inside accordion 1")
                gr.Textbox(label="Accordion Input 1")
            with gr.Accordion("Accordion 2", open=False):
                gr.Markdown("## Content inside accordion 2")
                gr.Slider(minimum=0, maximum=50, label="Accordion Slider")
            with gr.Accordion("Accordion 3", open=False):
                gr.Dataframe(headers=["Col1", "Col2"], label="Accordion Table")
            with gr.Row():
                with gr.Column():
                    gr.Markdown("### Column 1")
                    gr.Textbox(label="Col1 Input")
                with gr.Column():
                    gr.Markdown("### Column 2")
                    gr.Number(label="Col2 Input")

        with gr.Tab("More", id="more"):
            gr.HighlightedText(
                label="HighlightedText",
                value=[("Hello ", None), ("world", "POS")],
            )
            gr.Label(label="Label", value={"cat": 0.7, "dog": 0.3})
            gr.Plot(label="Plot")
            gr.HTML(value="<div>HTML content</div>")
            gr.Markdown("### Markdown content")

if __name__ == "__main__":
    demo.launch()
