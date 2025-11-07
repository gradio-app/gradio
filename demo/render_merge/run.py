import gradio as gr
import time

with gr.Blocks() as demo:
    text_count = gr.Slider(1, 5, step=1, label="Textbox Count")

    @gr.render(inputs=text_count)
    def render_count(count):
        boxes = []
        for i in range(count):
            box = gr.Textbox(label=f"Box {i}")
            boxes.append(box)

        def merge(*args):
            time.sleep(1)  # simulate a delay
            return " ".join(args)

        merge_btn.click(merge, boxes, output)

        def clear():
            time.sleep(1)  # simulate a delay
            return [" "] * count

        clear_btn.click(clear, None, boxes)

        def countup():
            time.sleep(1)  # simulate a delay
            return list(range(count))

        count_btn.click(countup, None, boxes, queue=False)

    with gr.Row():
        merge_btn = gr.Button("Merge")
        clear_btn = gr.Button("Clear")
        count_btn = gr.Button("Count")

    output = gr.Textbox()

if __name__ == "__main__":
    demo.launch()
