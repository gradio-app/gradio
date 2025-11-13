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
            column_count=3,
            column_limits=[3, 3],
        ),
        gr.Dropdown(["M", "F", "O"]),
    ],
    "dataframe",
    api_name="predict",
    description="Enter gender as 'M', 'F', or 'O' for other.",
)

if __name__ == "__main__":
    demo.launch()
