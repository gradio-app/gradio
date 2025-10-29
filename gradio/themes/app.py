import time

import gradio as gr
from gradio.themes.utils.theme_dropdown import create_theme_dropdown

dropdown, js = create_theme_dropdown()

with gr.Blocks() as demo:
    with gr.Row(equal_height=True):
        with gr.Column(scale=10):
            gr.Markdown(
                """
                # Theme preview: `{THEME}`
                To use this theme, set `theme='{AUTHOR}/{SPACE_NAME}'` in the `launch()` method of `gr.Blocks()` or `gr.Interface()`.
                You can append an `@` and a semantic version expression, e.g. @>=1.0.0,<2.0.0 to pin to a given version
                of this theme.
                """
            )
        with gr.Column(scale=3):
            with gr.Group():
                dropdown.render()
                toggle_dark = gr.Button(value="Toggle Dark")

    dropdown.change(None, dropdown, None, js=js)
    toggle_dark.click(
        None,
        js="""
        () => {
            document.body.classList.toggle('dark');
        }
        """,
    )

    name = gr.Textbox(
        label="Name",
        info="Full name, including middle name. No special characters.",
        placeholder="John Doe",
        value="John Doe",
        interactive=True,
    )

    with gr.Row():
        slider1 = gr.Slider(label="Slider 1")
        slider2 = gr.Slider(label="Slider 2")
    gr.CheckboxGroup(["A", "B", "C"], label="Checkbox Group")

    with gr.Row():
        with gr.Column(variant="panel", scale=1):
            gr.Markdown("## Panel 1")
            radio = gr.Radio(
                ["A", "B", "C"],
                label="Radio",
                info="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            )
            drop = gr.Dropdown(["Option 1", "Option 2", "Option 3"], show_label=False)
            drop_2 = gr.Dropdown(
                ["Option A", "Option B", "Option C"],
                multiselect=True,
                value=["Option A"],
                label="Dropdown",
                interactive=True,
            )
            check = gr.Checkbox(label="Go")
        with gr.Column(variant="panel", scale=2):
            img = gr.Image(
                "https://gradio-static-files.s3.us-west-2.amazonaws.com/header-image.jpg",
                label="Image",
                height=320,
            )
            with gr.Row():
                go_btn = gr.Button("Go", variant="primary")
                clear_btn = gr.Button("Clear", variant="secondary")

                def go(*_args):
                    time.sleep(3)
                    return "https://gradio-static-files.s3.us-west-2.amazonaws.com/header-image.jpg"

                go_btn.click(go, [radio, drop, drop_2, check, name], img, api_name="go")

                def clear():
                    time.sleep(0.2)

                clear_btn.click(clear, None, img)

            with gr.Row():
                btn1 = gr.Button("Button 1", size="sm")
                btn2 = gr.UploadButton(size="sm")
                stop_btn = gr.Button("Stop", size="sm", variant="stop")

    with gr.Row():
        gr.Dataframe(value=[[1, 2, 3], [4, 5, 6], [7, 8, 9]], label="Dataframe")
        gr.JSON(
            value={"a": 1, "b": 2, "c": {"test": "a", "test2": [1, 2, 3]}}, label="JSON"
        )
        gr.Label(value={"cat": 0.7, "dog": 0.2, "fish": 0.1})
        gr.File()
    with gr.Row():
        gr.ColorPicker()
        gr.Video("https://gradio-static-files.s3.us-west-2.amazonaws.com/world.mp4")
        gr.Gallery(
            [
                (
                    "https://gradio-static-files.s3.us-west-2.amazonaws.com/lion.jpg",
                    "lion",
                ),
                (
                    "https://gradio-static-files.s3.us-west-2.amazonaws.com/logo.png",
                    "logo",
                ),
                (
                    "https://gradio-static-files.s3.us-west-2.amazonaws.com/tower.jpg",
                    "tower",
                ),
            ],
            height=200,
        )

    with gr.Row():
        with gr.Column(scale=2):
            chatbot = gr.Chatbot([("Hello", "Hi")], label="Chatbot")
            chat_btn = gr.Button("Add messages")

            chat_btn.click(
                lambda history: history
                + [["How are you?", "I am good."]]
                + (time.sleep(2) or []),
                chatbot,
                chatbot,
            )
        with gr.Column(scale=1):
            with gr.Accordion("Advanced Settings"):
                gr.Markdown("Hello")
                gr.Number(label="Chatbot control 1")
                gr.Number(label="Chatbot control 2")
                gr.Number(label="Chatbot control 3")


if __name__ == "__main__":
    demo.queue().launch(theme=gr.themes.Default())
