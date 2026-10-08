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

    with gr.Accordion("Synced Accordion", open=False) as synced_acc:
        gr.Textbox(label="Synced Child")

    backend_open_btn = gr.Button("Open (backend)")
    backend_open_btn.click(
        fn=lambda: gr.Accordion(open=True), inputs=None, outputs=synced_acc
    )
    backend_close_btn = gr.Button("Close (backend)")
    backend_close_btn.click(
        fn=lambda: gr.Accordion(open=False), inputs=None, outputs=synced_acc
    )

    with gr.Accordion("Staged Accordion", open=False, visible=False) as staged_acc:
        gr.Textbox(label="Staged Child")

    stage_btn = gr.Button("Stage (visible=hidden)")
    stage_btn.click(
        fn=lambda: gr.Accordion(visible="hidden", open=True),
        inputs=None,
        outputs=staged_acc,
    )
    show_staged_btn = gr.Button("Show Staged")
    show_staged_btn.click(
        fn=lambda: gr.Accordion(visible=True), inputs=None, outputs=staged_acc
    )

    with gr.Accordion("Hidden Open Accordion", open=True, visible=False) as open_acc:
        gr.Textbox(label="Hidden Open Child")

    collapse_log = gr.Textbox(label="Collapse Log")
    open_acc.collapse(fn=lambda: "collapsed", inputs=None, outputs=collapse_log)
    reveal_closed_btn = gr.Button("Reveal Closed")
    reveal_closed_btn.click(
        fn=lambda: gr.Accordion(visible=True, open=False),
        inputs=None,
        outputs=open_acc,
    )

    json_log = gr.Textbox(label="JSON Change Log")
    with gr.Accordion("JSON Accordion", open=False):
        json_data = gr.JSON(value={"a": 1})
    json_data.change(fn=lambda log: log + "change\n", inputs=json_log, outputs=json_log)

    render_count = gr.State(0)
    render_log = gr.Textbox(label="Rerender Log")
    rerender_btn = gr.Button("Re-render")
    rerender_btn.click(fn=lambda n: n + 1, inputs=render_count, outputs=render_count)

    @gr.render(inputs=render_count)
    def render_accordion(n):
        with gr.Accordion("Rendered Accordion", open=False, key="rendered-acc") as acc:
            gr.Textbox(label="Rendered Child", key="rendered-child")
        acc.collapse(
            fn=lambda log: log + "collapse\n", inputs=render_log, outputs=render_log
        )


if __name__ == "__main__":
    demo.launch()
