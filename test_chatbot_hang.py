import gradio as gr

with gr.Blocks() as demo:
    with gr.Tab('Tab 1'):
        with gr.Row():
            gr.Chatbot()
            with gr.Column():
                gr.Slider()
                gr.Slider()
                gr.Slider()

    with gr.Tab('Tab 2'):
        textbox = gr.Textbox()

    demo.load(
        fn=lambda: 'some text',
        inputs=None,
        outputs=textbox,
    )

demo.launch()
