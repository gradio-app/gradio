import gradio as gr

with gr.Blocks() as demo:
    def combine(a, b):
        return a + " " + b

    txt = gr.Textbox(label="Input")
    txt_2 = gr.Textbox(label="Input 2")
    txt_3 = gr.Textbox(value="", label="Output")
    btn = gr.Button(value="Submit")
    btn.click(combine, inputs=[txt, txt_2], outputs=[txt_3])
    gr.Examples(
        [["hi", "Adam"], ["hello", "Eve"]],
        [txt, txt_2],
        txt_3,
        combine,
        cache_examples=True,
        api_name="examples",
    )

demo.launch()