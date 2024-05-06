import gradio as gr

with gr.Blocks() as demo:
    text_count = gr.Slider(1, 10, step=1, label="Textbox Count")

    @gr.render(inputs=[text_count], triggers=[text_count.change])
    def render_count(count):
        for i in range(count):
            gr.Textbox(key=i)

    gr.Button("Merge")

if __name__ == "__main__":
    demo.launch()