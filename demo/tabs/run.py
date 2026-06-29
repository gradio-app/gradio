import gradio as gr

with gr.Blocks() as demo:
    with gr.Tabs() as outer_tabs:
        with gr.Tab("Set 1"):
            with gr.Tabs(selected="a3") as tabs_1:
                tabset_1 = []
                textset_1 = []
                for i in range(10):
                    with gr.Tab(f"Tab {i+1}", id=f"a{i+1}") as tab:
                        gr.Markdown(f"Text {i+1}!")
                        textbox = gr.Textbox(label=f"Input {i+1}")
                        tabset_1.append(tab)
                        textset_1.append(textbox)
        with gr.Tab("Set 2"):
            tabset_2 = []
            textset_2 = []
            for i in range(10):
                with gr.Tab(f"Tab {i+11}") as tab:
                    gr.Markdown(f"Text {i+11}!")
                    textbox = gr.Textbox(label=f"Input {i+11}")
                    tabset_2.append(tab)
                    textset_2.append(textbox)

        for text1, text2 in zip(textset_1, textset_2):
            text1.submit(lambda x: x, text1, text2)

        with gr.Tab("Locked Tab", id="locked", interactive=False) as locked_tab:
            gr.Markdown("This tab was unlocked!")

    selected = gr.Textbox(label="Selected Tab")
    outer_selected = gr.Textbox(label="Outer Container Tab")
    select_count = gr.Number(label="Tab Select Count", value=0)
    with gr.Row():
        hide_odd_btn = gr.Button("Hide Odd Tabs")
        show_all_btn = gr.Button("Show All Tabs")
        make_even_uninteractive_btn = gr.Button("Make Even Tabs Uninteractive")
        make_all_interactive_btn = gr.Button("Make All Tabs Interactive")
        unlock_btn = gr.Button("Unlock Tab")

    select_tab_num = gr.Number(label="Select Tab #", value=1)

    hide_odd_btn.click(lambda: [gr.Tab(visible=i % 2 == 1) for i, _ in enumerate(tabset_1 + tabset_2)], outputs=(tabset_1 + tabset_2))
    show_all_btn.click(lambda: [gr.Tab(visible=True) for tab in tabset_1 + tabset_2], outputs=(tabset_1 + tabset_2))
    make_even_uninteractive_btn.click(lambda: [gr.Tab(interactive=i % 2 == 0) for i, _ in enumerate(tabset_1 + tabset_2)], outputs=(tabset_1 + tabset_2))
    make_all_interactive_btn.click(lambda: [gr.Tab(interactive=True) for tab in tabset_1 + tabset_2], outputs=(tabset_1 + tabset_2))
    unlock_btn.click(lambda: gr.Tab(interactive=True), outputs=locked_tab)
    select_tab_num.submit(lambda x: gr.Tabs(selected=f"a{x}"), inputs=select_tab_num, outputs=tabs_1)

    def get_selected_index(count, evt: gr.SelectData):
        # `trigger_mode="multiple"` so that a per-tab `select` firing more than
        # once per change (a regression we want to catch) would bump the count
        # past 1 instead of being suppressed by the default "once" mode.
        return evt.value, count + 1
    gr.on([tab.select for tab in tabset_1 + tabset_2], get_selected_index, inputs=select_count, outputs=[selected, select_count], trigger_mode="multiple")

    # The `select` event on a Tabs container should fire when its active tab changes.
    def get_outer_selected(evt: gr.SelectData):
        return evt.value
    outer_tabs.select(get_outer_selected, None, outer_selected)

if __name__ == "__main__":
    demo.launch()
