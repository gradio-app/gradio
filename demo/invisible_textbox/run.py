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
        with gr.Tab("Third Tab"):
            with gr.Accordion("Third Tab Accordion", open=True, visible=False) as acc:
                third_msg = gr.Textbox(label="Visible Textbox", interactive=True, visible=True)
                hidden_number = gr.Number(visible=False, label="Hidden Number", value=100, elem_id="hidden-number")
                show_number_btn = gr.Button("Show Number")
                hide_number_btn = gr.Button("Hide Number")
                show_number_btn.click(lambda: gr.Number(visible=True), outputs=hidden_number)
                hide_number_btn.click(lambda: gr.Number(visible=False), outputs=hidden_number)

            show_third_message = gr.Button("Show Accordion")
            show_third_message.click(lambda: gr.Accordion(visible=True), outputs=acc)
            hide_third_message = gr.Button("Hide Accordion")
            hide_third_message.click(lambda: gr.Accordion(visible=False), outputs=acc)
if __name__ == "__main__":
    demo.launch()