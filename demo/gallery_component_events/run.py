import gradio as gr

with gr.Blocks() as demo:
    cheetahs = [
        "https://gradio-builds.s3.amazonaws.com/assets/cheetah-003.jpg",
        "https://gradio-builds.s3.amazonaws.com/assets/lite-logo.png",
        "https://gradio-builds.s3.amazonaws.com/assets/TheCheethcat.jpg",
    ]
    with gr.Row():
        with gr.Column():
            gal = gr.Gallery(columns=4, interactive=True, label="Input Gallery")
            btn = gr.Button()
        with gr.Column():
            output_gal = gr.Gallery(columns=4, interactive=True, label="Output Gallery")
    with gr.Row():
        textbox = gr.Json(label="uploaded files")
        num_upload = gr.Number(value=0, label="Num Upload")
        num_change = gr.Number(value=0, label="Num Change")
        select_output = gr.Textbox(label="Select Data")
        gal.upload(lambda v,n: (v, v, n+1), [gal, num_upload], [textbox, output_gal, num_upload])
        gal.change(lambda v,n: (v, v, n+1), [gal, num_change], [textbox, output_gal, num_change])

    btn.click(lambda: cheetahs, None, [output_gal])

    def select(select_data: gr.SelectData):
        return select_data.value['image']['url']

    output_gal.select(select, None, select_output)

if __name__ == "__main__":
    demo.launch()
