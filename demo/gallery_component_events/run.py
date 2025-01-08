import gradio as gr

with gr.Blocks() as demo:
    files = [
        "https://gradio-builds.s3.amazonaws.com/assets/cheetah-003.jpg",
        "https://gradio-static-files.s3.amazonaws.com/world.mp4",
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
        preview_open = gr.Number(value=0, label="Preview Open?")
        select_output = gr.Textbox(label="Select Data")
        gal.upload(lambda v,n: (v, v, n+1), [gal, num_upload], [textbox, output_gal, num_upload])
        gal.change(lambda v,n: (v, v, n+1), [gal, num_change], [textbox, output_gal, num_change])
        output_gal.preview_open(lambda: 1, inputs=None, outputs=preview_open)
        output_gal.preview_close(lambda: 0, inputs=None, outputs=preview_open)

    btn.click(lambda: files, None, [output_gal])

    def select(select_data: gr.SelectData):
        return select_data.value['image']['url'] if 'image' in select_data.value else select_data.value['video']['url']

    output_gal.select(select, None, select_output)

if __name__ == "__main__":
    demo.launch()
