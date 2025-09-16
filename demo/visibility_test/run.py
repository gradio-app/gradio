import gradio as gr


def toggle_visibility(choice, input_text):
    """Toggle visibility based on choice and return current input value."""
    updates = {}

    if choice == "Visible":
        updates["textbox"] = gr.update(visible=True)
        updates["button"] = gr.update(visible=True)
    elif choice == "Hidden (in DOM)":
        updates["textbox"] = gr.update(visible="hidden")
        updates["button"] = gr.update(visible="hidden")
    else:  # "Not Visible (removed)"
        updates["textbox"] = gr.update(visible=False)
        updates["button"] = gr.update(visible=False)

    return updates["textbox"], updates["button"], f"Current value: {input_text}"


def get_value(input_text):
    """Get the current value from the textbox."""
    return f"Retrieved value: {input_text}"


def increment_counter(counter):
    """Increment counter to test event handling."""
    return counter + 1


with gr.Blocks() as demo:
    gr.Markdown("# Visibility Test Demo")
    gr.Markdown(
        "Test the three visibility states: visible=True, visible='hidden', visible=False"
    )

    with gr.Row():
        visibility_radio = gr.Radio(
            ["Visible", "Hidden (in DOM)", "Not Visible (removed)"],
            label="Choose visibility state",
            value="Visible",
            elem_id="visibility-radio",
        )

    with gr.Row():
        with gr.Column():
            textbox = gr.Textbox(
                label="Test Input",
                value="Initial text",
                elem_id="test-textbox",
                visible=True,
            )
            button = gr.Button("Get Value", elem_id="test-button", visible=True)

            # Hidden counter for testing events on hidden elements
            counter = gr.Number(value=0, visible=False, elem_id="counter")

            increment_btn = gr.Button(
                "Increment Counter",
                elem_id="increment-button",
            )
            counter_result = gr.Textbox(
                label="Counter Result", elem_id="counter-result"
            )

        with gr.Column():
            status = gr.Textbox(label="Status", elem_id="status-output")
            output = gr.Textbox(label="Output", elem_id="output-textbox")

    # Wire up the events
    visibility_radio.change(
        toggle_visibility,
        inputs=[visibility_radio, textbox],
        outputs=[textbox, button, status],
    )

    button.click(get_value, inputs=textbox, outputs=output)
    counter.change(
        lambda x: f"Counter Result: {x}", inputs=counter, outputs=counter_result
    )
    increment_btn.click(increment_counter, inputs=counter, outputs=counter)


if __name__ == "__main__":
    demo.launch()
