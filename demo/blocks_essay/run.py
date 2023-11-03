import gradio as gr


def change_textbox(choice):
    if choice == "short":
        return gr.Textbox(lines=2, visible=True), gr.Button(interactive=True)
    elif choice == "long":
        return gr.Textbox(lines=8, visible=True, value="Lorem ipsum dolor sit amet"), gr.Button(interactive=True)
    else:
        return gr.Textbox(visible=False), gr.Button(interactive=False)


with gr.Blocks() as demo:
    radio = gr.Radio(
        ["short", "long", "none"], label="What kind of essay would you like to write?"
    )
    text = gr.Textbox(lines=2, interactive=True, show_copy_button=True)

    with gr.Row():
        num = gr.Number(minimum=0, maximum=100, label="input")
        out = gr.Number(label="output")
    minimum_slider = gr.Slider(0, 100, 0, label="min")
    maximum_slider = gr.Slider(0, 100, 100, label="max")
    submit_btn = gr.Button("Submit", variant="primary")

    def reset_bounds(minimum, maximum):
        return gr.Number(minimum=minimum, maximum=maximum)

    radio.change(fn=change_textbox, inputs=radio, outputs=[text, submit_btn])
    gr.on(
        [minimum_slider.change, maximum_slider.change],
        reset_bounds,
        [minimum_slider, maximum_slider],
        outputs=num,
    )
    num.submit(lambda x: x, num, out)



if __name__ == "__main__":
    demo.launch()
