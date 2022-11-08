import gradio as gr


def filter_records(records, gender):
    return records[records["gender"] == gender]


demo = gr.Interface(
    filter_records,
    [
        gr.Dataframe(
            headers=["name", "age", "gender"],
            datatype=["str", "number", "str"],
            row_count=5,
            col_count=(3, "fixed"),
        ),
        gr.Dropdown(["M", "F", "O"]),
    ],
    "dataframe",
    description="Enter gender as 'M', 'F', or 'O' for other.",
)

if __name__ == "__main__":
    demo.launch()
