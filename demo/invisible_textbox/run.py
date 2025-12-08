import gradio as gr

with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.Tab("Invisible Textbox Demo"):
            textbox = gr.Textbox(visible=False, interactive=True, elem_id="test-textbox")

            make_visible_btn = gr.Button("Show")
            hide = gr.Button("Hide")
            def show():
                return gr.Textbox(visible=True)
            make_visible_btn.click(fn=show, outputs=textbox)
            hide.click(lambda: gr.Textbox(visible=False), outputs=textbox)
        with gr.Tab("Another Tab"):
            msg = gr.Markdown("This is another tab to demonstrate that invisible components work across tabs.", visible=False)
            show_message = gr.Button("Show Message")
            show_message.click(lambda: gr.Markdown(visible=True), outputs=msg)
if __name__ == "__main__":
    demo.launch()