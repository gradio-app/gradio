import gradio as gr
import time


JS_ON_LOAD = """
element.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
        trigger('click', {clicked: button.innerText});
    });
});
"""


with gr.Blocks() as demo:
    text_count = gr.Slider(1, 5, value=1, step=1, label="Textbox Count")

    @gr.render(inputs=text_count)
    def render_count(count):
        boxes = []
        for i in range(count):
            box = gr.Textbox(label=f"Box {i}")
            boxes.append(box)

        def merge(*args):
            time.sleep(0.2)  # simulate a delay
            return " ".join(args)

        merge_btn.click(merge, boxes, output)

        def clear():
            time.sleep(0.2)  # simulate a delay
            return [" "] * count

        clear_btn.click(clear, None, boxes)

        def countup():
            time.sleep(0.2)  # simulate a delay
            return list(range(count))

        count_btn.click(countup, None, boxes, queue=False)

    with gr.Row():
        merge_btn = gr.Button("Merge")
        clear_btn = gr.Button("Clear")
        count_btn = gr.Button("Count")

    output = gr.Textbox()

    html_button_count = gr.State(2)

    @gr.render(inputs=html_button_count)
    def render_html_buttons(count):
        buttons = gr.HTML(
            "".join(f"<button>HTML button {i}</button>" for i in range(count)),
            js_on_load=JS_ON_LOAD,
        )
        clicked = gr.Textbox(label="Clicked HTML button")

        def select_button(evt: gr.EventData):
            return evt.clicked

        buttons.click(select_button, outputs=clicked)

    add_html_button = gr.Button("Add HTML button")
    add_html_button.click(
        lambda count: count + 1,
        inputs=html_button_count,
        outputs=html_button_count,
    )

if __name__ == "__main__":
    demo.launch()
