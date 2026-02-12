import gradio as gr


def validate_input(age, location):
    return [
        gr.validate(not age or age > 3, "Age must be at least 3"),
        gr.validate("london" not in location.lower(), "Location must not be in London"),
    ]


def process_text(age, location):
    return f"Processed: {age} -- {location.upper()}"


with gr.Blocks() as demo:
    gr.Markdown("# Validator Parameter Test Demo")

    with gr.Row():
        with gr.Column():
            age = gr.Number(
                label="Enter age",
                placeholder="Enter age",
            )
            location = gr.Textbox(
                max_lines=3,
                label="Enter location",
                placeholder="Enter location",
            )

    validate_btn = gr.Button("Process with Validation", variant="primary")

    output_with_validation = gr.Textbox(
        label="Output (with validation)", interactive=False
    )

    validate_btn.click(
        fn=process_text,
        validator=validate_input,
        inputs=[age, location],
        outputs=output_with_validation,
    )


if __name__ == "__main__":
    demo.launch()
