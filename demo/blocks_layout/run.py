import gradio as gr


theme = gr.themes.Solid()

theme.color_text_body = "white"
theme.color_text_code_background = "white"
theme.color_text_label = "white"
theme.color_text_body_dark = "#50fa7b"

theme.input_background_base = "#44475a"
theme.color_background_tertiary = "#6272a4"
theme.input_background_base_dark = "#44475a"

theme.color_border_primary = "#6272a4"
theme.color_border_primary_dark = "#6272a4"

theme.block_background = "#6272a4"
theme.block_background_dark = "#6272a4"

theme.block_label_background_dark = "#282a36"

theme.color_background_primary_dark = "#282a36"
theme.color_background_primary = "#282a36"

theme.button_primary_border_color_base_dark = "#ff79c6"
theme.button_primary_border_color_base = "#ff79c6"

theme.button_primary_border_color_hover_dark = "#ff79c6"
theme.button_primary_border_color_hover = "#ff79c6"

theme.button_primary_border_color_focus_dark = "#ff79c6"
theme.button_primary_border_color_focus = "#ff79c6"

theme.button_primary_text_color_base_dark = "white"
theme.button_primary_text_color_base = "white"

theme.button_primary_text_color_hover_dark = "white"
theme.button_primary_text_color_hover = "white"

theme.button_primary_text_color_focus_dark = "white"
theme.button_primary_text_color_focus = "white"


theme.button_primary_background_base_dark = (
    "linear-gradient(to bottom right, #ff79c6, #ff79c6)"
)
theme.button_primary_background_hover_dark = (
    "linear-gradient(to bottom right, #ff79c6, #ffd7ee)"
)
theme.button_primary_background_focus_dark = (
    "linear-gradient(to bottom right, #ff79c6, #ffd7ee)"
)


theme.button_primary_background_base = (
    "linear-gradient(to bottom right, #ff79c6, #ff79c6)"
)
theme.button_primary_background_hover = (
    "linear-gradient(to bottom right, #ff79c6, #ffd7ee)"
)
theme.button_primary_background_focus = (
    "linear-gradient(to bottom right, #ff79c6, #ffd7ee)"
)

demo = gr.Blocks(theme=theme)

with demo:
    with gr.Row():
        gr.Image(interactive=True)
        gr.Image()
    with gr.Row():
        gr.Textbox(label="Text")
        gr.Number(label="Count")
        gr.Radio(choices=["One", "Two"])
    with gr.Row():
        gr.Button(variant="primary")
    with gr.Row():
        with gr.Row():
            with gr.Column():
                gr.Textbox(label="Text")
                gr.Number(label="Count")
                gr.Radio(choices=["One", "Two"])
            gr.Image()
            with gr.Column():
                gr.Image(interactive=True)
                gr.Image()
    gr.Textbox(label="Text")
    gr.Number(label="Count")
    gr.Radio(choices=["One", "Two"])


if __name__ == "__main__":
    demo.launch()
