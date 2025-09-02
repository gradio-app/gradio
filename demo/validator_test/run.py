"""Demo to test the validator parameter functionality."""

import gradio as gr
import time


def validate_input(text):
    if not text or len(text) < 3:
        raise gr.ValidatorError("Input must be at least 3 characters long!")

    if "error" in text.lower():
        raise gr.ValidatorError("Input cannot contain the word 'error'!")


def process_text(text):
    time.sleep(1)
    result = f"Processed: {text.upper()}"
    return result


def process_without_validation(text):
    time.sleep(1)
    return f"Direct: {text.upper()}"


with gr.Blocks() as demo:
    gr.Markdown("# Validator Parameter Test Demo")

    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(
                label="Enter text (min 3 chars, no 'error' word)",
                placeholder="Type something here...",
            )

            with gr.Row():
                validate_btn = gr.Button("Process with Validation", variant="primary")
                direct_btn = gr.Button("Process without Validation")

        with gr.Column():
            output_with_validation = gr.Textbox(
                label="Output (with validation)", interactive=False
            )
            output_without_validation = gr.Textbox(
                label="Output (without validation)", interactive=False
            )
            status = gr.Textbox(label="Status", interactive=False)

    validate_btn.click(
        fn=process_text,
        validator=validate_input,
        inputs=input_text,
        outputs=output_with_validation,
    ).success(
        lambda: "✅ Validation passed and processing completed!",
        outputs=status,
        queue=False,
    ).failure(lambda: "❌ Validation failed! Check your input.", outputs=status)

    direct_btn.click(
        fn=process_without_validation,
        inputs=input_text,
        outputs=output_without_validation,
        queue=True,
    ).success(lambda: "✅ Direct processing completed!", outputs=status)

    gr.Markdown("---")
    gr.Markdown("### Comparison with manual .then() chaining")

    with gr.Row():
        manual_input = gr.Textbox(label="Manual chaining input")
        manual_btn = gr.Button("Process with manual .then()")
        manual_output = gr.Textbox(label="Manual chaining output")

    manual_btn.click(
        fn=validate_input,
        inputs=manual_input,
        outputs=None,
        queue=False,
    ).then(
        fn=process_text,
        inputs=manual_input,
        outputs=manual_output,
        queue=True,
    )


if __name__ == "__main__":
    demo.launch()
