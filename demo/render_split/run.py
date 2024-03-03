import gradio as gr

with gr.Blocks() as demo:
    input_text = gr.Textbox(label="input")
    split_btn = gr.Button("Split")

    @gr.render(inputs=input_text, triggers=[split_btn.click])
    def show_split(text):
        if len(text) == 0:
            gr.Markdown("## No Input Provided")
        else:
            for letter in text:
                gr.Textbox(letter)

if __name__ == "__main__":
    demo.launch()
