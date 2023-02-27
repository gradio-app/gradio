import gradio as gr
import time
from os.path import abspath, join, pardir

KS_FILES = abspath(join(pardir, "kitchen_sink", "files"))

base_theme = gr.themes.Base()
default_theme = gr.themes.Default()
monochrome_theme = gr.themes.Monochrome()
flow_theme = gr.themes.Flow()


with gr.Blocks() as demo:
    gr.Markdown(
        """
    # Blocks Kitchen Sink
    This is a demo of most Gradio features. Test all themes and toogle dark mode (requires light mode setting)
    ## Elements
    - Use of Rows, Columns, Tabs, and Accordion
    - Use of Form elements: Textbox, Dropdown, Checkbox, Radio, Slider
    ## Other
    Other stuff
    - Buttons of variants: "primary", "secondary", "stop"
    - Embedded interface
    - Custom progress bar
    """
    )
    toggle_dark = gr.Button("Toggle Dark").style(full_width=False)
    toggle_dark.click(
        None,
        _js="""
        () => { 
            document.body.classList.toggle('dark');
            document.querySelector('gradio-app').style.backgroundColor = 'var(--color-background-primary)'
        }
        """,
    )
    theme_selector = gr.Radio(
        ["Base", "Default", "Monochrome", "Flow"], value="Default", label="Theme"
    )
    theme_selector.change(
        None,
        theme_selector,
        None,
        _js=f"""
        (theme) => {{
            if (!document.querySelector('.theme-css')) {{
                var theme_elem = document.createElement('style');
                theme_elem.classList.add('theme-css');
                document.head.appendChild(theme_elem);
            }} else {{
                var theme_elem = document.querySelector('.theme-css');
            }}
            if (theme == "Base") {{
                var theme_css = `{base_theme._get_theme_css()}`;
            }} else if (theme == "Default") {{
                var theme_css = `{default_theme._get_theme_css()}`;
            }} else if (theme == "Monochrome") {{
                var theme_css = `{monochrome_theme._get_theme_css()}`;
            }} else if (theme == "Flow") {{
                var theme_css = `{flow_theme._get_theme_css()}`;
            }}
            theme_elem.innerHTML = theme_css;
        }}
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
            drop = gr.Dropdown(["Option 1", "Option 2", "Option 3"], label="Dropdown")
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
                "https://gradio.app/assets/img/header-image.jpg", label="Image"
            ).style(height=320)
            with gr.Row():
                go_btn = gr.Button("Go", label="Primary Button", variant="primary")
                clear_btn = gr.Button(
                    "Clear", label="Secondary Button", variant="secondary"
                )

                def go(*argss):
                    time.sleep(3)
                    return "https://gradio.app/assets/img/header-image.jpg"

                go_btn.click(go, [radio, drop, drop_2, check, name], img, api_name="go")

                def clear():
                    time.sleep(0.2)
                    return None

                clear_btn.click(clear, None, img)

            with gr.Row():
                btn1 = gr.Button("Button 1").style(size="sm")
                btn2 = gr.UploadButton().style(size="sm")
                stop_btn = gr.Button("Stop", label="Stop Button", variant="stop").style(
                    size="sm"
                )

            gr.Examples(
                examples=[join(KS_FILES, "lion.jpg"), join(KS_FILES, "tower.jpg")],
                inputs=img,
            )

    gr.Examples(
        examples=[
            ["A", "Option 1", ["Option B"], True, join(KS_FILES, "lion.jpg")],
            [
                "B",
                "Option 2",
                ["Option B", "Option C"],
                False,
                join(KS_FILES, "tower.jpg"),
            ],
        ],
        inputs=[radio, drop, drop_2, check, img],
    )

    gr.Markdown("## Media Files")

    with gr.Tab("Audio"):
        with gr.Row():
            gr.Audio()
            gr.Audio(source="microphone")
            gr.Audio(join(KS_FILES, "cantina.wav"))
    with gr.Tab("Other"):
        # gr.Image(source="webcam")
        gr.HTML(
            "<div style='width: 100px; height: 100px; background-color: blue;'></div>"
        )
    with gr.Row():
        gr.Dataframe(value=[[1, 2, 3], [4, 5, 6], [7, 8, 9]], label="Dataframe")
        gr.JSON(
            value={"a": 1, "b": 2, "c": {"test": "a", "test2": [1, 2, 3]}}, label="JSON"
        )
        gr.Label(value={"cat": 0.7, "dog": 0.2, "fish": 0.1})
        gr.File()
        gr.ColorPicker()
        gr.Video(join(KS_FILES, "world.mp4"))
        gr.Gallery(
            [
                (join(KS_FILES, "lion.jpg"), "lion"),
                (join(KS_FILES, "logo.png"), "logo"),
                (join(KS_FILES, "tower.jpg"), "tower"),
            ]
        )

    with gr.Row():
        with gr.Column(scale=2):
            gr.Chatbot(
                [["Hello", "Hi"], ["How are you?", "I am good."]], label="Chatbot"
            )
        with gr.Column(scale=1):
            with gr.Accordion("Advanced Settings"):
                gr.Markdown("Hello")
                gr.Number(label="Chatbot control 1")
                gr.Number(label="Chatbot control 2")
                gr.Number(label="Chatbot control 3")

    gr.Markdown("## Dataset Examples")

    component_example_set = [
        (gr.Audio(render=False), join(KS_FILES, "cantina.wav")),
        (gr.Checkbox(render=False), True),
        (gr.CheckboxGroup(render=False), ["A", "B"]),
        (gr.ColorPicker(render=False), "#FF0000"),
        (gr.Dataframe(render=False), [[1, 2, 3], [4, 5, 6]]),
        (gr.Dropdown(render=False), "A"),
        (gr.File(render=False), join(KS_FILES, "lion.jpg")),
        (gr.HTML(render=False), "<div>Test</div>"),
        (gr.Image(render=False), join(KS_FILES, "lion.jpg")),
        (gr.Markdown(render=False), "# Test"),
        (gr.Number(render=False), 1),
        (gr.Radio(render=False), "A"),
        (gr.Slider(render=False), 1),
        (gr.Textbox(render=False), "A"),
        (gr.Video(render=False), join(KS_FILES, "world.mp4")),
    ]
    gr.Dataset(
        components=[c for c, _ in component_example_set],
        samples=[[e for _, e in component_example_set]],
    )

    with gr.Tabs():
        for c, e in component_example_set:
            with gr.Tab(c.__class__.__name__):
                gr.Dataset(components=[c], samples=[[e]] * 3)


if __name__ == "__main__":
    demo.launch(file_directories=[KS_FILES])
