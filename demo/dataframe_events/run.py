import gradio as gr
import pandas as pd
import numpy as np

def update_dataframe():
    regular_df = pd.DataFrame(np.random.randint(1, 10, size=(5, 5)), columns=pd.Index([str(i) for i in range(5)]))
    wide_df = pd.DataFrame([
        [5, 22, 91, 17, 73, 38, 84, 46, 65, 10, 155, 122, 11, 144, 133],
        [81, 42, 13, 97, 33, 77, 59, 100, 29, 61, 213, 195, 142, 118, 127],
        [37, 71, 63, 102, 28, 94, 19, 55, 88, 44, 116, 139, 122, 150, 147],
        [104, 52, 49, 26, 83, 67, 31, 92, 79, 18, 241, 115, 159, 123, 137],
        [16, 95, 74, 68, 43, 101, 27, 85, 39, 57, 129, 148, 132, 111, 156]
    ], columns=pd.Index([f"col_{i}" for i in range(15)]))
    tall_df = pd.DataFrame(np.random.randint(1, 10, size=(50, 3)), columns=pd.Index(["A", "B", "C"]))
    return regular_df, wide_df, tall_df

def clear_dataframes():
    regular_empty_df = pd.DataFrame([], columns=pd.Index([str(i) for i in range(5)]))
    wide_empty_df = pd.DataFrame([], columns=pd.Index([f"col_{i}" for i in range(15)]))
    tall_empty_df = pd.DataFrame([], columns=pd.Index(["A", "B", "C"]))
    return regular_empty_df, wide_empty_df, tall_empty_df

def increment_select_counter(evt: gr.SelectData, count):
    count_val = 1 if count is None else count + 1
    return count_val, evt.index, evt.value

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column(scale=1):
            initial_regular_df = pd.DataFrame(np.zeros((5, 5), dtype=int), columns=pd.Index([str(i) for i in range(5)]))

            df = gr.Dataframe(
                value=initial_regular_df,
                interactive=True,
                label="Interactive Dataframe",
                show_label=True,
                elem_id="dataframe",
                show_search="filter",
                show_copy_button=True,
                show_row_numbers=True,
            )

        with gr.Column(scale=1):
            initial_wide_df = pd.DataFrame(np.zeros((5, 15), dtype=int), columns=pd.Index([f"col_{i}" for i in range(15)]))

            df_view = gr.Dataframe(
                value=initial_wide_df,
                interactive=False,
                label="Non-Interactive View (Scroll Horizontally)",
                show_label=True,
                show_search="search",
                elem_id="non-interactive-dataframe",
                show_copy_button=True,
                show_row_numbers=True,
                show_fullscreen_button=True,
            )

    with gr.Row():
        initial_tall_df = pd.DataFrame(np.zeros((50, 3), dtype=int), columns=pd.Index(["A", "B", "C"]))

        df_tall = gr.Dataframe(
            value=initial_tall_df,
            interactive=False,
            label="Tall Dataframe (Scroll Vertically)",
            show_label=True,
            elem_id="dataframe_tall",
            show_copy_button=True,
            show_row_numbers=True,
            max_height=300,
        )

    with gr.Row():
        with gr.Column():
            update_btn = gr.Button("Update dataframe", elem_id="update_btn")
            clear_btn = gr.Button("Clear dataframe", elem_id="clear_btn")

    with gr.Row():
        change_events = gr.Number(
            value=0, label="Change events", elem_id="change_events"
        )
        input_events = gr.Number(value=0, label="Input events", elem_id="input_events")
        select_events = gr.Number(
            value=0, label="Select events", elem_id="select_events"
        )

    with gr.Row():
        selected_cell_index = gr.Textbox(
            label="Selected cell index", elem_id="selected_cell_index"
        )
        selected_cell_value = gr.Textbox(
            label="Selected cell value", elem_id="selected_cell_value"
        )

    update_btn.click(fn=update_dataframe, outputs=[df, df_view, df_tall])
    clear_btn.click(fn=clear_dataframes, outputs=[df, df_view, df_tall])
    df.change(fn=lambda x: x + 1, inputs=[change_events], outputs=[change_events])
    df.input(fn=lambda x: x + 1, inputs=[input_events], outputs=[input_events])
    df.select(
        fn=increment_select_counter,
        inputs=[select_events],
        outputs=[select_events, selected_cell_index, selected_cell_value],
    )

if __name__ == "__main__":
    demo.launch()
