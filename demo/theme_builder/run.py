import gradio as gr
import time
import inspect

themes = [
    gr.themes.Base,
    gr.themes.Default,
    gr.themes.Soft,
    gr.themes.Monochrome,
    gr.themes.Glass,
]
colors = gr.themes.Color.all
sizes = gr.themes.Size.all

palette_range = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
size_range = ["xxs", "xs", "sm", "md", "lg", "xl", "xxl"]
docs_theme_core = gr.documentation.document_fn(gr.themes.Base.__init__, gr.themes.Base)[
    1
]
docs_theme_vars = gr.documentation.document_fn(gr.themes.Base.set, gr.themes.Base)[1]


def get_docstr(var):
    for parameters in docs_theme_core + docs_theme_vars:
        if parameters["name"] == var:
            return parameters["doc"]
    raise ValueError(f"Variable {var} not found in theme documentation.")


def get_doc_theme_var_groups():
    source = inspect.getsource(gr.themes.Base.set)
    groups = []
    group, desc, variables, flat_variables = None, None, [], []
    for line in source.splitlines():
        line = line.strip()
        if line.startswith(")"):
            break
        elif line.startswith("# "):
            if group is not None:
                groups.append((group, desc, variables))
            group, desc = line[2:].split(": ")
            variables = []
        elif "=" in line:
            var = line.split("=")[0]
            variables.append(var)
            flat_variables.append(var)
    groups.append((group, desc, variables))
    return groups, flat_variables


variable_groups, flat_variables = get_doc_theme_var_groups()

css = """
.gradio-container {
    overflow: visible !important;
    max-width: none !important;
}
#controls {
    max-height: 100vh;
    overflow-y: scroll;
    position: sticky;
    top: 0;    
}
#controls::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}

#controls::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, .5);
  box-shadow: 0 0 1px rgba(255, 255, 255, .5);
}
"""

with gr.Blocks(theme=gr.themes.Base(), css=css) as demo:
    with gr.Row():
        with gr.Column(scale=1, elem_id="controls"):
            with gr.Tabs():
                with gr.TabItem("Theme Controls"):
                    gr.Markdown(
                        """
                    ## Theme Builder
                    This tool allows you to build your own custom theme for Gradio. As you make changes, the app on the right will update in real time.
                    First, select a base theme below you would like to build off of. Note: when you click 'Load Theme', all variable values in other tabs will be overwritten!
                    """
                    )
                    base_theme_dropdown = gr.Dropdown(
                        [theme.__name__ for theme in themes],
                        value="Base",
                        show_label=False,
                    )
                    load_theme_btn = gr.Button("Load Theme")

                    gr.Markdown(
                        """
                    Click on the tabs above to set various styling aspects of your theme. 
                    When you are done, click on "View Code" to see your theme code, or push it to the Hub to share! 
                    """
                    )
                with gr.TabItem("Core Colors"):
                    gr.Markdown(
                        """Set the three hues of the theme: `primary_hue`, `secondary_hue`, and `neutral_hue`. 
                        Each of these is a palette ranging from 50 to 950 in brightness. Pick a preset palette - optionally, open the accordion to overwrite specific values.
                        Note that these variables do not affect elements directly, but are referenced by other variables with asterisks, such as `*primary_200` or `*neutral_950`."""
                    )
                    primary_hue = gr.Dropdown(
                        [color.name for color in colors], label="Primary Hue"
                    )
                    with gr.Accordion(label="Primary Hue Palette", open=False):
                        primary_hues = []
                        for i in palette_range:
                            primary_hues.append(
                                gr.ColorPicker(
                                    label=f"primary_{i}",
                                )
                            )

                    secondary_hue = gr.Dropdown(
                        [color.name for color in colors], label="Secondary Hue"
                    )
                    with gr.Accordion(label="Secondary Hue Palette", open=False):
                        secondary_hues = []
                        for i in palette_range:
                            secondary_hues.append(
                                gr.ColorPicker(
                                    label=f"secondary_{i}",
                                )
                            )

                    neutral_hue = gr.Dropdown(
                        [color.name for color in colors], label="Neutral hue"
                    )
                    with gr.Accordion(label="Neutral Hue Palette", open=False):
                        neutral_hues = []
                        for i in palette_range:
                            neutral_hues.append(
                                gr.ColorPicker(
                                    label=f"neutral_{i}",
                                )
                            )

                with gr.TabItem("Core Sizing"):
                    gr.Markdown(
                        """Set the sizing of the theme via: `text_size`, `spacing_size`, and `radius_size`.
                        Each of these is set to a collection of sizes ranging from `xxs` to `xxl`. Pick a preset size collection - optionally, open the accordion to overwrite specific values.
                        Note that these variables do not affect elements directly, but are referenced by other variables with asterisks, such as `*spacing_xl` or `*text_sm`.
                        """
                    )
                    text_size = gr.Dropdown(
                        [size.name for size in sizes if size.name.startswith("text_")],
                        label="Text Size",
                    )
                    with gr.Accordion(label="Text Size Range", open=False):
                        text_sizes = []
                        for i in size_range:
                            text_sizes.append(
                                gr.Textbox(
                                    label=f"text_{i}",
                                )
                            )

                    spacing_size = gr.Dropdown(
                        [
                            size.name
                            for size in sizes
                            if size.name.startswith("spacing_")
                        ],
                        label="Spacing Size",
                    )
                    with gr.Accordion(label="Spacing Size Range", open=False):
                        spacing_sizes = []
                        for i in size_range:
                            spacing_sizes.append(
                                gr.Textbox(
                                    label=f"spacing_{i}",
                                )
                            )

                    radius_size = gr.Dropdown(
                        [
                            size.name
                            for size in sizes
                            if size.name.startswith("radius_")
                        ],
                        label="Radius Size",
                    )
                    with gr.Accordion(label="Radius Size Range", open=False):
                        radius_sizes = []
                        for i in size_range:
                            radius_sizes.append(
                                gr.Textbox(
                                    label=f"radius_{i}",
                                )
                            )

                with gr.TabItem("Core Fonts"):
                    gr.Markdown(
                        """Set the main `font` and the monospace `font_mono` here. 
                        Set up to 4 values for each (fallbacks in case a font is not available).
                        Check "Google Font" if font should be loaded from Google Fonts.
                        """
                    )
                    gr.Markdown("### Main Font")
                    main_fonts, main_is_google = [], []
                    for i in range(4):
                        with gr.Row():
                            font = gr.Textbox(label=f"Font {i + 1}")
                            font_is_google = gr.Checkbox(label="Google Font")
                            main_fonts.append(font)
                            main_is_google.append(font_is_google)

                    mono_fonts, mono_is_google = [], []
                    gr.Markdown("### Monospace Font")
                    for i in range(4):
                        with gr.Row():
                            font = gr.Textbox(label=f"Font {i + 1}")
                            font_is_google = gr.Checkbox(label="Google Font")
                            mono_fonts.append(font)
                            mono_is_google.append(font_is_google)

                theme_var_textboxes = []
                for group, desc, variables in variable_groups:
                    with gr.TabItem(group):
                        gr.Markdown(desc)
                        for variable in variables:
                            textbox = gr.Textbox(
                                label=variable, info=get_docstr(variable)
                            )
                            theme_var_textboxes.append(textbox)

        secret_css = gr.Textbox(visible=False)

        demo.load(
            None,
            None,
            None,
            _js="""() => {document.head.innerHTML += "<style id='theme_css'></style>"}""",
        )

        theme_inputs = (
            [primary_hue, secondary_hue, neutral_hue]
            + primary_hues
            + secondary_hues
            + neutral_hues
            + [text_size, spacing_size, radius_size]
            + text_sizes
            + spacing_sizes
            + radius_sizes
            + main_fonts
            + main_is_google
            + mono_fonts
            + mono_is_google
            + theme_var_textboxes
        )

        def load_theme(theme_name):
            theme = [theme for theme in themes if theme.__name__ == theme_name][0]

            expand_color = lambda color: list(
                [
                    color.c50,
                    color.c100,
                    color.c200,
                    color.c300,
                    color.c400,
                    color.c500,
                    color.c600,
                    color.c700,
                    color.c800,
                    color.c900,
                    color.c950,
                ]
            )
            expand_size = lambda size: list(
                [
                    size.xxs,
                    size.xs,
                    size.sm,
                    size.md,
                    size.lg,
                    size.xl,
                    size.xxl,
                ]
            )
            parameters = inspect.signature(theme.__init__).parameters
            primary_hue = parameters["primary_hue"].default
            secondary_hue = parameters["secondary_hue"].default
            neutral_hue = parameters["neutral_hue"].default
            text_size = parameters["text_size"].default
            spacing_size = parameters["spacing_size"].default
            radius_size = parameters["radius_size"].default

            theme = theme()

            font = theme._font[:4]
            font_mono = theme._font_mono[:4]
            font_is_google = [isinstance(f, gr.themes.GoogleFont) for f in font]
            font_mono_is_google = [
                isinstance(f, gr.themes.GoogleFont) for f in font_mono
            ]
            font = [f.name for f in font]
            font_mono = [f.name for f in font_mono]
            pad_to_4 = lambda x: x + [None] * (4 - len(x))

            font, font_is_google = pad_to_4(font), pad_to_4(font_is_google)
            font_mono, font_mono_is_google = pad_to_4(font_mono), pad_to_4(
                font_mono_is_google
            )

            var_output = []
            for variable in flat_variables:
                var_output.append(str(getattr(theme, variable)))

            return (
                [primary_hue.name, secondary_hue.name, neutral_hue.name]
                + expand_color(primary_hue)
                + expand_color(secondary_hue)
                + expand_color(neutral_hue)
                + [text_size.name, spacing_size.name, radius_size.name]
                + expand_size(text_size)
                + expand_size(spacing_size)
                + expand_size(radius_size)
                + font
                + font_is_google
                + font_mono
                + font_mono_is_google
                + var_output
            )

        demo.load(load_theme, base_theme_dropdown, theme_inputs)

        def render_variables(*args):
            primary_hue, secondary_hue, neutral_hue = args[0:3]
            primary_hues = args[3 : 3 + len(palette_range)]
            secondary_hues = args[3 + len(palette_range) : 3 + 2 * len(palette_range)]
            neutral_hues = args[3 + 2 * len(palette_range) : 3 + 3 * len(palette_range)]
            text_size, spacing_size, radius_size = args[
                3 + 3 * len(palette_range) : 6 + 3 * len(palette_range)
            ]
            text_sizes = args[
                6
                + 3 * len(palette_range) : 6
                + 3 * len(palette_range)
                + len(size_range)
            ]
            spacing_sizes = args[
                6
                + 3 * len(palette_range)
                + len(size_range) : 6
                + 3 * len(palette_range)
                + 2 * len(size_range)
            ]
            radius_sizes = args[
                6
                + 3 * len(palette_range)
                + 2 * len(size_range) : 6
                + 3 * len(palette_range)
                + 3 * len(size_range)
            ]
            main_fonts = args[
                6
                + 3 * len(palette_range)
                + 3 * len(size_range) : 6
                + 3 * len(palette_range)
                + 3 * len(size_range)
                + 4
            ]
            main_is_google = args[
                6
                + 3 * len(palette_range)
                + 3 * len(size_range)
                + 4 : 6
                + 3 * len(palette_range)
                + 3 * len(size_range)
                + 8
            ]
            mono_fonts = args[
                6
                + 3 * len(palette_range)
                + 3 * len(size_range)
                + 8 : 6
                + 3 * len(palette_range)
                + 3 * len(size_range)
                + 12
            ]
            mono_is_google = args[
                6
                + 3 * len(palette_range)
                + 3 * len(size_range)
                + 12 : 6
                + 3 * len(palette_range)
                + 3 * len(size_range)
                + 16
            ]
            remaining_args = args[
                6 + 3 * len(palette_range) + 3 * len(size_range) + 16 :
            ]

            final_primary_color = gr.themes.Color(*primary_hues)
            final_secondary_color = gr.themes.Color(*secondary_hues)
            final_neutral_color = gr.themes.Color(*neutral_hues)
            final_text_size = gr.themes.Size(*text_sizes)
            final_spacing_size = gr.themes.Size(*spacing_sizes)
            final_radius_size = gr.themes.Size(*radius_sizes)

            final_main_fonts = []
            for main_font, is_google in zip(main_fonts, main_is_google):
                if not main_font:
                    continue
                if is_google:
                    main_font = gr.themes.GoogleFont(main_font)
                final_main_fonts.append(main_font)
            final_mono_fonts = []
            for mono_font, is_google in zip(mono_fonts, mono_is_google):
                if not mono_font:
                    continue
                if is_google:
                    mono_font = gr.themes.GoogleFont(mono_font)
                final_mono_fonts.append(mono_font)

            theme = gr.themes.Base(
                primary_hue=final_primary_color,
                secondary_hue=final_secondary_color,
                neutral_hue=final_neutral_color,
                text_size=final_text_size,
                spacing_size=final_spacing_size,
                radius_size=final_radius_size,
                font=final_main_fonts,
                font_mono=final_mono_fonts,
            )

            theme.set(
                **{attr: val for attr, val in zip(flat_variables, remaining_args)}
            )
            return theme._get_theme_css()

        def attach_rerender(evt_listener):
            evt_listener(render_variables, theme_inputs, secret_css,).then(
                None,
                secret_css,
                None,
                _js="""(css) => {document.getElementById('theme_css').innerHTML = css}""",
            )

        def load_color(color_name):
            color = [color for color in colors if color.name == color_name][0]
            return [getattr(color, f"c{i}") for i in palette_range]

        attach_rerender(primary_hue.select(load_color, primary_hue, primary_hues).then)
        attach_rerender(
            secondary_hue.select(load_color, secondary_hue, secondary_hues).then
        )
        attach_rerender(neutral_hue.select(load_color, neutral_hue, neutral_hues).then)

        def load_size(size_name):
            size = [size for size in sizes if size.name == size_name][0]
            return [getattr(size, i) for i in size_range]

        attach_rerender(text_size.change(load_size, text_size, text_sizes).then)
        attach_rerender(
            spacing_size.change(load_size, spacing_size, spacing_sizes).then
        )
        attach_rerender(radius_size.change(load_size, radius_size, radius_sizes).then)

        attach_rerender(
            load_theme_btn.click(load_theme, base_theme_dropdown, theme_inputs).then
        )

        for theme_box in (
            theme_var_textboxes
            + text_sizes
            + spacing_sizes
            + radius_sizes
            + main_fonts
            + mono_fonts
        ):
            attach_rerender(theme_box.blur)
            attach_rerender(theme_box.submit)

        ### App ###

        with gr.Column(scale=6, elem_id="app"):
            with gr.Column(variant="panel"):
                with gr.Accordion("View Code", open=False):
                    pass
                with gr.Row():
                    hf_hub_token = gr.Textbox(
                        placeholder="Hugging Face Hub Token", show_label=False
                    ).style(container=False)
                    upload_to_hub_btn = gr.Button("Upload to Hub")
                    dark_mode = gr.Button("Dark Mode", variant="primary")
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
                    drop = gr.Dropdown(
                        ["Option 1", "Option 2", "Option 3"], show_label=False
                    )
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
                        go_btn = gr.Button(
                            "Go", label="Primary Button", variant="primary"
                        )
                        clear_btn = gr.Button(
                            "Clear", label="Secondary Button", variant="secondary"
                        )

                        def go(*args):
                            time.sleep(3)
                            return "https://gradio.app/assets/img/header-image.jpg"

                        go_btn.click(
                            go, [radio, drop, drop_2, check, name], img, api_name="go"
                        )

                        def clear():
                            time.sleep(0.2)
                            return None

                        clear_btn.click(clear, None, img)

                    with gr.Row():
                        btn1 = gr.Button("Button 1").style(size="sm")
                        btn2 = gr.UploadButton().style(size="sm")
                        stop_btn = gr.Button(
                            "Stop", label="Stop Button", variant="stop"
                        ).style(size="sm")

            with gr.Row():
                gr.Dataframe(value=[[1, 2, 3], [4, 5, 6], [7, 8, 9]], label="Dataframe")
                gr.JSON(
                    value={"a": 1, "b": 2, "c": {"test": "a", "test2": [1, 2, 3]}},
                    label="JSON",
                )
                gr.Label(value={"cat": 0.7, "dog": 0.2, "fish": 0.1})
                gr.File()
            with gr.Row():
                gr.ColorPicker()
                gr.Video(
                    "https://gradio-static-files.s3.us-west-2.amazonaws.com/world.mp4"
                )
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
                    ]
                ).style(height="200px", grid=2)

            with gr.Row():
                with gr.Column(scale=2):
                    chatbot = gr.Chatbot([("Hello", "Hi")], label="Chatbot")
                    chat_btn = gr.Button("Add messages")

                    def chat(history):
                        time.sleep(2)
                        yield [["How are you?", "I am good."]]

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
    demo.launch()
