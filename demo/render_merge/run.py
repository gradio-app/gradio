import gradio as gr

with gr.Blocks() as demo:
    text_count = gr.Slider(1, 10, step=1, label="Textbox Count")

    @gr.render(inputs=[text_count], triggers=[text_count.change])
    def render_count(count):
        boxes = []
        for i in range(count):
            box = gr.Textbox(key=i)
            boxes.append(box)

        def merge(*args):
            return " ".join(args)
        
        merge_btn.click(merge, boxes, output)

    merge_btn = gr.Button("Merge")
    output = gr.Textbox()

if __name__ == "__main__":
    demo.launch()