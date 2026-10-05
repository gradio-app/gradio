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

            with gr.Accordion(
                "Hidden Accordion", open=False, visible=False
            ) as hidden_acc:
                details = gr.Textbox(label="Details")

            expand_count = gr.Number(label="Expand Count", value=0)
            hidden_acc.expand(
                fn=lambda n: n + 1,
                inputs=expand_count,
                outputs=expand_count,
            )

            reveal_btn = gr.Button("Reveal Accordion")
            reveal_btn.click(
                fn=lambda: gr.Accordion(visible=True, open=True),
                inputs=None,
                outputs=hidden_acc,
            )
        with gr.Tab("Tab 2", id="t2"):
            gr.Markdown("This is Tab 2 content.")

    swith_tabs_btn = gr.Button("Switch to Tab 2")
    swith_tabs_btn.click(
        fn=lambda: gr.Tabs(selected="t2"),
        inputs=None,
        outputs=tabs,
    )

    with gr.Tabs(visible=False, selected="a") as hidden_tabs:
        with gr.Tab("Tab A", id="a"):
            gr.Markdown("This is Tab A content.")
        with gr.Tab("Tab B", id="b"):
            gr.Markdown("This is Tab B content.")

    reveal_tabs_btn = gr.Button("Reveal Tabs")
    reveal_tabs_btn.click(
        fn=lambda: gr.Tabs(visible=True, selected="b"),
        inputs=None,
        outputs=hidden_tabs,
    )

    with gr.Accordion("Advanced", open=False):
        extra = gr.Textbox(label="Extra")

    hide_extra_btn = gr.Button("Hide Extra")
    hide_extra_btn.click(
        fn=lambda: gr.Textbox(visible=False),
        inputs=None,
        outputs=extra,
    )

if __name__ == "__main__":
    demo.launch()
