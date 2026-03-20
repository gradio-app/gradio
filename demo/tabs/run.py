import gradio as gr

with gr.Blocks() as demo:
    with gr.Tabs():
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

    selected = gr.Textbox(label="Selected Tab")
    with gr.Row():
        hide_odd_btn = gr.Button("Hide Odd Tabs")
        show_all_btn = gr.Button("Show All Tabs")
        make_even_uninteractive_btn = gr.Button("Make Even Tabs Uninteractive")
        make_all_interactive_btn = gr.Button("Make All Tabs Interactive")

    select_tab_num = gr.Number(label="Select Tab #", value=1)

    hide_odd_btn.click(lambda: [gr.Tab(visible=i % 2 == 1) for i, _ in enumerate(tabset_1 + tabset_2)], outputs=(tabset_1 + tabset_2))
    show_all_btn.click(lambda: [gr.Tab(visible=True) for tab in tabset_1 + tabset_2], outputs=(tabset_1 + tabset_2))
    make_even_uninteractive_btn.click(lambda: [gr.Tab(interactive=i % 2 == 0) for i, _ in enumerate(tabset_1 + tabset_2)], outputs=(tabset_1 + tabset_2))
    make_all_interactive_btn.click(lambda: [gr.Tab(interactive=True) for tab in tabset_1 + tabset_2], outputs=(tabset_1 + tabset_2))
    select_tab_num.submit(lambda x: gr.Tabs(selected=f"a{x}"), inputs=select_tab_num, outputs=tabs_1)

    def get_selected_index(evt: gr.SelectData):
        return evt.value
    gr.on([tab.select for tab in tabset_1 + tabset_2], get_selected_index, outputs=selected)

if __name__ == "__main__":
    demo.launch()
