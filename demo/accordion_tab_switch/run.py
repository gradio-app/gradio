import gradio as gr

with gr.Blocks() as demo:
    with gr.Tabs() as tabs:
        with gr.Tab("Tab 1", id="t1"):
            with gr.Accordion("Accordion", open=False) as acc:
                name = gr.Textbox(label="Name")

            accordion_open = gr.Checkbox(label="Accordion Open", value=False)

            accordion_open.change(
                fn=lambda is_open: gr.update(open=is_open),
                inputs=accordion_open,
                outputs=acc,
            )
        with gr.Tab("Tab 2", id="t2"):
            gr.Markdown("This is Tab 2 content.")

    swith_tabs_btn = gr.Button("Switch to Tab 2")
    swith_tabs_btn.click(
        fn=lambda: gr.Tabs(selected="t2"),
        inputs=None,
        outputs=tabs,
    )

if __name__ == "__main__":
    demo.launch()