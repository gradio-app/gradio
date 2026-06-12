import gradio as gr


def get_data():
    return [[i, f"Item {i}"] for i in range(10)]


with gr.Blocks() as demo:
    gr.Markdown("Switching to 'Tab 2' populates the dataframe via its select event.")

    with gr.Tab("Tab 1"):
        gr.Markdown("Click 'Tab 2'.")

    with gr.Tab("Tab 2") as tab2:
        df = gr.Dataframe(headers=["ID", "Name"], elem_id="tab_df")
        tab2.select(get_data, outputs=df)


if __name__ == "__main__":
    demo.launch()
