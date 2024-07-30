import gradio as gr

with gr.Blocks() as demo:

    with gr.Row():
        with gr.Column():
            upload_btn = gr.UploadButton(label="Upload Single File", file_count="single")
        with gr.Column():
            output_file_1 = gr.File(label="Upload Single File Output", file_count="single")
            num_load_btn_1 = gr.Number(label="# Load Upload Single File", value=0)
            output_click_1 = gr.Number(label="# Click Upload Single File Output", value=0)
            upload_btn.upload(lambda s,n: (s, n + 1), [upload_btn, num_load_btn_1], [output_file_1, num_load_btn_1])
            upload_btn.click(lambda n: (n + 1), output_click_1, [output_click_1])
    with gr.Row():
        with gr.Column():
            upload_btn_multiple = gr.UploadButton(label="Upload Multiple Files", file_count="multiple")
        with gr.Column():
            output_file_2 = gr.File(label="Upload Multiple Files Output", file_count="multiple")
            num_load_btn_2 = gr.Number(label="# Load Upload Multiple Files", value=0)
            output_click_2 = gr.Number(label="# Click Upload Multiple Files Output", value=0)
            upload_btn_multiple.upload(lambda s,n: (s, n + 1), [upload_btn_multiple, num_load_btn_2], [output_file_2, num_load_btn_2])
            upload_btn_multiple.click(lambda n: (n + 1), output_click_2, [output_click_2])

if __name__ == "__main__":
    demo.launch()
