import gradio as gr


def change_textbox(choice):
    if choice == "short":
        return gr.update(lines=2, visible=True)
    elif choice == "long":
        return gr.update(lines=8, visible=True)
    else:
        return gr.update(visible=False)


with gr.Blocks() as demo:
    radio = gr.Radio(
        ["short", "long", "none"], label="What kind of essay would you like to write?"
    )
    text = gr.Textbox(lines=2, interactive=True)

    radio.change(fn=change_textbox, inputs=radio, outputs=text)


if __name__ == "__main__":
    demo.launch()