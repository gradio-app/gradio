import gradio as gr

with gr.Blocks() as demo:
    textbox = gr.Textbox(visible=False, interactive=True, elem_id="test-textbox")

    make_visible_btn = gr.Button("Show")
    hide = gr.Button("Hide")
    def show():
        return gr.Textbox(visible=True)
    make_visible_btn.click(fn=show, outputs=textbox)
    hide.click(lambda: gr.Textbox(visible=False), outputs=textbox)

if __name__ == "__main__":
    demo.launch()
