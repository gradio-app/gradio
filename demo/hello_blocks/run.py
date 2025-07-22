import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        textbox1 = gr.Textbox(label="Textbox 1")
        textbox2 = gr.Textbox(label="Textbox 2")
    btn = gr.Button("Submit")

    def reverse_text(text):
        return text[::-1]

    btn.click(reverse_text, inputs=textbox1, outputs=textbox2)

demo.launch()