import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            image = gr.ImageEditor(label="Default Canvas. Not fixed", elem_id="default")
        with gr.Column():
            custom_canvas = gr.ImageEditor(label="Custom Canvas, not fixed", canvas_size=(300, 300),
                                           elem_id="small")
        with gr.Column():
            custom_canvas_fixed = gr.ImageEditor(label="Custom Canvas,fixed", canvas_size=(500, 500), fixed_canvas=True,
                                                 elem_id="fixed")
        with gr.Column():
            width = gr.Number(label="Width")
            height = gr.Number(label="Height")

    image.change(lambda x: x["composite"].shape, outputs=[height, width], inputs=image)
    custom_canvas.change(lambda x: x["composite"].shape, outputs=[height, width], inputs=custom_canvas)
    custom_canvas_fixed.change(lambda x: x["composite"].shape, outputs=[height, width], inputs=custom_canvas_fixed)

if __name__ == "__main__":
    demo.launch()