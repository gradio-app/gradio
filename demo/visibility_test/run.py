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


def reveal_hidden_column():
    """Generator that toggles two columns over multiple yields (issue #13494):
    the column that starts hidden must end up visible."""
    yield gr.update(visible=False), gr.update(visible=False)
    yield gr.update(visible=False), gr.update(visible=True)


def hide_revealed_column():
    yield gr.update(visible=True), gr.update(visible=True)
    yield gr.update(visible=True), gr.update(visible=False)


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
            counter = gr.Number(value=0, visible="hidden", elem_id="counter")

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

    # Regression coverage for #13494: a multi-yield generator that updates two
    # columns at once (one hidden, one revealed) must leave the revealed column
    # visible. The reveal/hide buttons sit outside both columns so they persist.
    with gr.Row():
        reveal_btn = gr.Button("Reveal Hidden Column", elem_id="yield-reveal")
        hide_btn = gr.Button("Hide Revealed Column", elem_id="yield-hide")
    with gr.Column(elem_id="yield-col-x") as yield_col_x:
        gr.Markdown("Column X")
    with gr.Column(visible=False, elem_id="yield-col-y") as yield_col_y:
        gr.Textbox(label="Revealed", elem_id="yield-target")

    reveal_btn.click(reveal_hidden_column, outputs=[yield_col_x, yield_col_y])
    hide_btn.click(hide_revealed_column, outputs=[yield_col_x, yield_col_y])


if __name__ == "__main__":
    demo.launch()
