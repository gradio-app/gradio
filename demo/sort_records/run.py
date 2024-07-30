import gradio as gr

def sort_records(records):
    return records.sort("Quantity")

demo = gr.Interface(
    sort_records,
    gr.Dataframe(
        headers=["Item", "Quantity"],
        datatype=["str", "number"],
        row_count=3,
        col_count=(2, "fixed"),
        type="polars"
    ),
    "dataframe",
    description="Sort by Quantity"
)

if __name__ == "__main__":
    demo.launch()
