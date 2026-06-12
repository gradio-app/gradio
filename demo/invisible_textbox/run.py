import gradio as gr

with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.Tab("Invisible Textbox Demo"):
            textbox = gr.Textbox(visible=False, interactive=True, elem_id="test-textbox")

            with gr.Row():
                make_visible_btn = gr.Button("Show")
                hide = gr.Button("Hide")
                make_invisible_btn = gr.Button("Make Invisible")

            def show():
                return gr.Textbox(visible=True)
            make_visible_btn.click(fn=show, outputs=textbox)
            hide.click(lambda: gr.Textbox(visible=False), outputs=textbox)
            make_invisible_btn.click(lambda: gr.Textbox(visible="hidden"), outputs=textbox)
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
        with gr.Tab("Sliders Tab"):
            slider1 = gr.Slider(0, 1, value=0, visible=False, elem_id="slider-1")
            slider2 = gr.Slider(0, 1, value=0, visible=False, elem_id="slider-2")
            show_sliders_btn = gr.Button("Show Sliders")
            hide_sliders_btn = gr.Button("Hide Sliders")
            show_sliders_btn.click(
                lambda: (gr.Slider(visible=True), gr.Slider(visible=True)),
                outputs=[slider1, slider2],
            )
            hide_sliders_btn.click(
                lambda: (gr.Slider(visible=False), gr.Slider(visible=False)),
                outputs=[slider1, slider2],
            )
if __name__ == "__main__":
    demo.launch()