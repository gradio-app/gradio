import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_3d = gr.Model3D(label="Input Model3D")
        with gr.Column():
            output_3d = gr.Model3D(label="Output Model3D")
        with gr.Column():
            num_change = gr.Number(label="# Change Events", value=0)
            num_load = gr.Number(label="# Upload Events", value=0)
            num_clear = gr.Number(label="# Clear Events", value=0)
            clear_value = gr.Textbox(label="Clear Value", value="")
        input_3d.upload(lambda s, n: (s, n + 1), [input_3d, num_load], [output_3d, num_load])
        input_3d.change(lambda n: n + 1, num_change, num_change)
        input_3d.clear(lambda s, n: (s, n + 1), [input_3d, num_clear], [clear_value, num_clear])

if __name__ == "__main__":
    demo.launch()
