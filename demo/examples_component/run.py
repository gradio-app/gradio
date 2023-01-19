import gradio as gr


def combine(a, b):
    return a + " " + b

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;} #col_1 {min-width: 0 !important; max-width: 25%; height: 100%;} #col_2 {min-width: 0 !important; max-width: 25%; height: 100%;} #col_3 {min-width: 0 !important; max-width: 25%; height: 100%;} #col_4 {min-width: 0 !important; max-width: 25%; height: 100%;}"

with gr.Blocks(css=css) as demo:
    with gr.Row():
        with gr.Column(elem_id="col_1"):
            txt = gr.Textbox(label="Input 1", elem_id="input_1_text")
        with gr.Column(elem_id="col_2"):
            txt_2 = gr.Textbox(label="Input 2", elem_id="input_2_text")
        with gr.Column(elem_id="col_3"):
            btn = gr.Button(value="Combine Inputs", elem_id="combine_button")
        with gr.Column(elem_id="col_4"):
            txt_3 = gr.Textbox(value="", label="Output", elem_id="output_text")
    btn.click(combine, inputs=[txt, txt_2], outputs=[txt_3])

    gr.Examples(
        [["Hello", "World"], ["Machine", "Learning"], ["Gradio", "Docs"]],
        [txt, txt_2],
        txt_3,
        combine,
        cache_examples=True,
    )
    
demo.launch()