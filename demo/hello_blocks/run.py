import gradio as gr

with gr.Blocks() as demo:
        with gr.Row():
            with gr.Column() as col:
                with gr.Row():
                    text = gr.Textbox("Hello")
            with gr.Column() as col2:
                with gr.Row():
                    gr.Textbox("Column 2")
        btn = gr.Button("Click")

        btn.click(lambda: gr.Column(visible=False), outputs=col)

demo.launch(server_name="0.0.0.0")