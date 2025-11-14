import gradio as gr

with gr.Blocks() as demo:
    input_text = gr.Textbox(label="Input Text")

    @gr.render(inputs=input_text, queue=False)
    def show_split(text):
        if len(text) == 0:
            gr.Markdown("## No Input Provided")
        else:
            for letter in text:
                with gr.Row():
                    text = gr.Textbox(letter, label=f"Letter {letter}")
                    btn = gr.Button("Clear")
                    btn.click(lambda: gr.Textbox(value=""), None, text)


if __name__ == "__main__":
    demo.launch()