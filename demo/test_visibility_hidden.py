import gradio as gr


def update_visibility(choice):
    print(choice)
    if choice == "Show":
        return gr.Textbox(visible=True)
    elif choice == "Hide (remove from DOM)":
        return gr.Textbox(visible=False)
    else:  # "Hide (keep in DOM)"
        return gr.Textbox(visible="hidden")


with gr.Blocks() as demo:
    gr.Markdown("# Test Visibility States")

    with gr.Row():
        radio = gr.Radio(
            ["Show", "Hide (remove from DOM)", "Hide (keep in DOM)"],
            label="Choose visibility state",
            value="Show",
        )

    with gr.Row():
        text_input = gr.Textbox(
            label="Test Input", value="I can be hidden in different ways!", visible=True
        )

    output = gr.Textbox(label="Output")

    radio.change(update_visibility, inputs=radio, outputs=text_input)


if __name__ == "__main__":
    demo.launch()
