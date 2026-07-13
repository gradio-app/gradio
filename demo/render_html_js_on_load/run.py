import gradio as gr


JS_ON_LOAD = """
element.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
        trigger('click', {clicked: button.innerText});
    });
});
"""


with gr.Blocks() as demo:
    button_count = gr.State(2)

    @gr.render(inputs=button_count)
    def render_buttons(count):
        buttons = gr.HTML(
            "".join(f"<button>HTML button {i}</button>" for i in range(count)),
            js_on_load=JS_ON_LOAD,
        )
        clicked = gr.Textbox(label="Clicked HTML button")

        def select_button(evt: gr.EventData):
            return evt.clicked

        buttons.click(select_button, outputs=clicked)

    add_button = gr.Button("Add HTML button")
    add_button.click(
        lambda count: count + 1, inputs=button_count, outputs=button_count
    )


if __name__ == "__main__":
    demo.launch()
