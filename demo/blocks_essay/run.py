import gradio as gr


def change_textbox(choice):
    if choice == "short":
        return gr.Textbox(lines=2, visible=True)
    elif choice == "long":
        return gr.Textbox(lines=8, visible=True, value="Lorem ipsum dolor sit amet")
    else:
        return gr.Textbox(visible=False)


with gr.Blocks() as demo:
    radio = gr.Radio(
        ["short", "long", "none"], label="What kind of essay would you like to write?"
    )
    text = gr.Textbox(lines=2, interactive=True, show_copy_button=True)
    radio.change(fn=change_textbox, inputs=radio, outputs=text)

    with gr.Row():
        num = gr.Number(minimum=0, maximum=100, label="input")
        out = gr.Number(label="output")
    min = gr.Slider(0, 100, 0, label="min")
    max = gr.Slider(0, 100, 100, label="max")

    def reset_bounds(min, max):
        return gr.Number(minimum=min, maximum=max)
    
    min.change(reset_bounds, [min, max], outputs=num)
    max.change(reset_bounds, [min, max], outputs=num)
    num.submit(lambda x:x, num, out)


if __name__ == "__main__":
    demo.launch()
