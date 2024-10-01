import gradio as gr

def delete_file(n: int, file: gr.DeletedFileData):
    return [file.file.path, n + 1]

with gr.Blocks() as demo:

    with gr.Row():
        with gr.Column():
            file_component = gr.File(label="Upload Single File", file_count="single")
        with gr.Column():
            output_file_1 = gr.File(
                label="Upload Single File Output", file_count="single"
            )
            num_load_btn_1 = gr.Number(label="# Load Upload Single File", value=0)
            file_component.upload(
                lambda s, n: (s, n + 1),
                [file_component, num_load_btn_1],
                [output_file_1, num_load_btn_1],
            )
    with gr.Row():
        with gr.Column():
            file_component_multiple = gr.File(
                label="Upload Multiple Files", file_count="multiple"
            )
        with gr.Column():
            output_file_2 = gr.File(
                label="Upload Multiple Files Output", file_count="multiple"
            )
            num_load_btn_2 = gr.Number(label="# Load Upload Multiple Files", value=0)
            file_component_multiple.upload(
                lambda s, n: (s, n + 1),
                [file_component_multiple, num_load_btn_2],
                [output_file_2, num_load_btn_2],
            )
    with gr.Row():
        with gr.Column():
            file_component_specific = gr.File(
                label="Upload Multiple Files Image/Video",
                file_count="multiple",
                file_types=["image", "video"],
            )
        with gr.Column():
            output_file_3 = gr.File(
                label="Upload Multiple Files Output Image/Video", file_count="multiple"
            )
            num_load_btn_3 = gr.Number(
                label="# Load Upload Multiple Files Image/Video", value=0
            )
            file_component_specific.upload(
                lambda s, n: (s, n + 1),
                [file_component_specific, num_load_btn_3],
                [output_file_3, num_load_btn_3],
            )
    with gr.Row():
        with gr.Column():
            file_component_pdf = gr.File(label="Upload PDF File", file_types=[".pdf"])
        with gr.Column():
            output_file_4 = gr.File(label="Upload PDF File Output")
            num_load_btn_4 = gr.Number(label="# Load Upload PDF File", value=0)
            file_component_pdf.upload(
                lambda s, n: (s, n + 1),
                [file_component_pdf, num_load_btn_4],
                [output_file_4, num_load_btn_4],
            )
    with gr.Row():
        with gr.Column():
            file_component_invalid = gr.File(
                label="Upload File with Invalid file_types",
                file_types=["invalid file_type"],
            )
        with gr.Column():
            output_file_5 = gr.File(label="Upload File with Invalid file_types Output")
            num_load_btn_5 = gr.Number(
                label="# Load Upload File with Invalid file_types", value=0
            )
            file_component_invalid.upload(
                lambda s, n: (s, n + 1),
                [file_component_invalid, num_load_btn_5],
                [output_file_5, num_load_btn_5],
            )
    with gr.Row():
        with gr.Column():
            del_file_input = gr.File(label="Delete File", file_count="multiple")
        with gr.Column():
            del_file_data = gr.Textbox(label="Delete file data")
            num_load_btn_6 = gr.Number(label="# Deleted File", value=0)
            del_file_input.delete(
                delete_file,
                [num_load_btn_6],
                [del_file_data, num_load_btn_6],
            )
    # f = gr.File(label="Upload many File", file_count="multiple")
    # # f.delete(delete_file)
    # f.delete(delete_file, inputs=None, outputs=None)

if __name__ == "__main__":
    demo.launch()
