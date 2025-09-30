import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("## Tab render_children parameter")
    with gr.Tabs():
        with gr.Tab("Tab 1") as tab1:
            gr.Markdown("This tab is visible by default")
        with gr.Tab("Tab 2", render_children=True) as tab2:
            tb = gr.Textbox(label="Will be rendered but hidden", elem_id="invisible-but-rendered")
            tb2 = gr.Textbox(label="Will not be rendered", elem_id="invisible-and-not-rendered", visible=False)
            btn = gr.Button("Make textbox interactive", variant="primary")
            btn.click(lambda: gr.update(interactive=True), None, tb)

if __name__ == "__main__":
    demo.launch()