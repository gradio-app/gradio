import gradio as gr

with gr.Blocks() as demo:
    @gr.render()
    def query_render(request:gr.Request):
        for key, value in request.query_params.items():
            with gr.Row():
                gr.Textbox(key)
                gr.Textbox(value)

demo.launch()