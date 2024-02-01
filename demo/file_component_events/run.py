import gradio as gr

with gr.Blocks() as demo:
    
    with gr.Row():
        with gr.Column():
            file_component = gr.File(label="Upload Single File", file_count="single")
        with gr.Column():
            output_file_1 = gr.File(label="Upload Single File Output", file_count="single")
            num_load_btn_1 = gr.Number(label="# Load Upload Single File", value=0)
            file_component.upload(lambda s,n: (s, n + 1), [file_component, num_load_btn_1], [output_file_1, num_load_btn_1])
    with gr.Row():
        with gr.Column():
            file_component_multiple = gr.File(label="Upload Multiple Files", file_count="multiple")
        with gr.Column():
            output_file_2 = gr.File(label="Upload Multiple Files Output", file_count="multiple")
            num_load_btn_2 = gr.Number(label="# Load Upload Multiple Files", value=0)
            file_component_multiple.upload(lambda s,n: (s, n + 1), [file_component_multiple, num_load_btn_2], [output_file_2, num_load_btn_2])
    with gr.Row():
        with gr.Column():
            file_component_specific = gr.File(label="Upload Multiple Files Image/Video", file_count="multiple", file_types=["image", "video"])
        with gr.Column():
            output_file_3 = gr.File(label="Upload Multiple Files Output Image/Video", file_count="multiple")
            num_load_btn_3 = gr.Number(label="# Load Upload Multiple Files Image/Video", value=0)
            file_component_specific.upload(lambda s,n: (s, n + 1), [file_component_specific, num_load_btn_3], [output_file_3, num_load_btn_3])

if __name__ == "__main__":
    demo.launch()
