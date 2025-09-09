import gradio as gr


def validate_input(age, location):
    is_age_valid = True
    is_location_valid = True
    if not age or age < 3:
        is_age_valid = False
    if "london" in location.lower():
        is_location_valid = False

    return [
        gr.validate(is_age_valid, "Age must be at least 3"),
        gr.validate(is_location_valid, "Location must not be in London"),
    ]


def process_text(age, location):
    result = f"Processed: {age} -- {location.upper()}"
    return result


def validate_image(image):
    # we don't want to error when a user is clearing the image
    if not image:
        return None
    is_portrait = image.width < image.height

    return gr.validate(is_portrait, "Image must be in portrait mode")


def process_image(image):
    if not image:
        return "No image uploaded"
    return "HELLO IMAGE!!!"


def raise_error():
    raise ValueError("test error")


with gr.Blocks() as demo:
    with gr.Tab("Text"):
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
    with gr.Tab("Image"):
        im = gr.Image(label="Enter image", placeholder="Enter image", type="pil")
        t = gr.Textbox(label="Enter text", placeholder="Enter text")
        im.change(
            fn=process_image,
            validator=validate_image,
            inputs=im,
            outputs=t,
        )
    with gr.Tab("Validation Error"):
        error_btn = gr.Button("Raise Validation Error", variant="primary")
        error_btn.click(
            validator=raise_error,
            fn=raise_error,
            inputs=[],
            outputs=[],
        )


if __name__ == "__main__":
    demo.launch()
