import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():  # Row for textboxes
        textbox1 = gr.Textbox(label="Textbox 1")
        textbox2 = gr.Textbox(label="Textbox 2")
    
    with gr.Row():  # Row for buttons
        btn = gr.Button("Reverse")

    def reverse_and_capitalize(text):
        return text[::-1]

    btn.click(reverse_and_capitalize, inputs=textbox1, outputs=textbox2)
    textbox1.submit(reverse_and_capitalize, inputs=textbox1, outputs=textbox2)

demo.launch()