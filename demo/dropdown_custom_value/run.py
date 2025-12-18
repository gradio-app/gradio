import gradio

with gradio.Blocks() as demo:
    dropdown = gradio.Dropdown(
        choices=[("hello", "goodbye"), ("abc", "123")],
        allow_custom_value=True,
        label="Dropdown",
    )
    text = gradio.Textbox(label="Output")
    dropdown.change(lambda x: x, inputs=dropdown, outputs=text)

if __name__ == "__main__":
    demo.launch()