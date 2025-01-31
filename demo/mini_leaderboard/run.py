# type: ignore
import gradio as gr
import pandas as pd
from pathlib import Path

abs_path = Path(__file__).parent.absolute()

df = pd.read_json(str(abs_path / "assets/leaderboard_data.json"))
invisible_df = df.copy()

COLS = [
    "T",
    "Model",
    "Average ⬆️",
    "ARC",
    "HellaSwag",
    "MMLU",
    "TruthfulQA",
    "Winogrande",
    "GSM8K",
    "Type",
    "Architecture",
    "Precision",
    "Merged",
    "Hub License",
    "#Params (B)",
    "Hub ❤️",
    "Model sha",
    "model_name_for_query",
]
ON_LOAD_COLS = [
    "T",
    "Model",
    "Average ⬆️",
    "ARC",
    "HellaSwag",
    "MMLU",
    "TruthfulQA",
    "Winogrande",
    "GSM8K",
    "model_name_for_query",
]
TYPES = [
    "str",
    "markdown",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "str",
    "str",
    "str",
    "str",
    "bool",
    "str",
    "number",
    "number",
    "bool",
    "str",
    "bool",
    "bool",
    "str",
]
NUMERIC_INTERVALS = {
    "?": pd.Interval(-1, 0, closed="right"),
    "~1.5": pd.Interval(0, 2, closed="right"),
    "~3": pd.Interval(2, 4, closed="right"),
    "~7": pd.Interval(4, 9, closed="right"),
    "~13": pd.Interval(9, 20, closed="right"),
    "~35": pd.Interval(20, 45, closed="right"),
    "~60": pd.Interval(45, 70, closed="right"),
    "70+": pd.Interval(70, 10000, closed="right"),
}
MODEL_TYPE = [str(s) for s in df["T"].unique()]
Precision = [str(s) for s in df["Precision"].unique()]

# Searching and filtering
def update_table(
    hidden_df: pd.DataFrame,
    columns: list,
    type_query: list,
    precision_query: str,
    size_query: list,
    query: str,
):
    filtered_df = filter_models(hidden_df, type_query, size_query, precision_query)  # type: ignore
    filtered_df = filter_queries(query, filtered_df)
    df = select_columns(filtered_df, columns)
    return df

def search_table(df: pd.DataFrame, query: str) -> pd.DataFrame:
    return df[(df["model_name_for_query"].str.contains(query, case=False))]  # type: ignore

def select_columns(df: pd.DataFrame, columns: list) -> pd.DataFrame:
    # We use COLS to maintain sorting
    filtered_df = df[[c for c in COLS if c in df.columns and c in columns]]
    return filtered_df  # type: ignore

def filter_queries(query: str, filtered_df: pd.DataFrame) -> pd.DataFrame:
    final_df = []
    if query != "":
        queries = [q.strip() for q in query.split(";")]
        for _q in queries:
            _q = _q.strip()
            if _q != "":
                temp_filtered_df = search_table(filtered_df, _q)
                if len(temp_filtered_df) > 0:
                    final_df.append(temp_filtered_df)
        if len(final_df) > 0:
            filtered_df = pd.concat(final_df)
            filtered_df = filtered_df.drop_duplicates(  # type: ignore
                subset=["Model", "Precision", "Model sha"]
            )

    return filtered_df

def filter_models(
    df: pd.DataFrame,
    type_query: list,
    size_query: list,
    precision_query: list,
) -> pd.DataFrame:
    # Show all models
    filtered_df = df

    type_emoji = [t[0] for t in type_query]
    filtered_df = filtered_df.loc[df["T"].isin(type_emoji)]
    filtered_df = filtered_df.loc[df["Precision"].isin(precision_query + ["None"])]

    numeric_interval = pd.IntervalIndex(
        sorted([NUMERIC_INTERVALS[s] for s in size_query])  # type: ignore
    )
    params_column = pd.to_numeric(df["#Params (B)"], errors="coerce")
    mask = params_column.apply(lambda x: any(numeric_interval.contains(x)))  # type: ignore
    filtered_df = filtered_df.loc[mask]

    return filtered_df

demo = gr.Blocks(css=str(abs_path / "assets/leaderboard_data.json"))
with demo:
    gr.Markdown("""Test Space of the LLM Leaderboard""", elem_classes="markdown-text")

    with gr.Tabs(elem_classes="tab-buttons") as tabs:
        with gr.TabItem("🏅 LLM Benchmark", elem_id="llm-benchmark-tab-table", id=0):
            with gr.Row():
                with gr.Column():
                    with gr.Row():
                        search_bar = gr.Textbox(
                            placeholder=" 🔍 Search for your model (separate multiple queries with `;`) and press ENTER...",
                            show_label=False,
                            elem_id="search-bar",
                        )
                    with gr.Row():
                        shown_columns = gr.CheckboxGroup(
                            choices=COLS,
                            value=ON_LOAD_COLS,
                            label="Select columns to show",
                            elem_id="column-select",
                            interactive=True,
                        )
                with gr.Column(min_width=320):
                    filter_columns_type = gr.CheckboxGroup(
                        label="Model types",
                        choices=MODEL_TYPE,
                        value=MODEL_TYPE,
                        interactive=True,
                        elem_id="filter-columns-type",
                    )
                    filter_columns_precision = gr.CheckboxGroup(
                        label="Precision",
                        choices=Precision,
                        value=Precision,
                        interactive=True,
                        elem_id="filter-columns-precision",
                    )
                    filter_columns_size = gr.CheckboxGroup(
                        label="Model sizes (in billions of parameters)",
                        choices=list(NUMERIC_INTERVALS.keys()),
                        value=list(NUMERIC_INTERVALS.keys()),
                        interactive=True,
                        elem_id="filter-columns-size",
                    )

            leaderboard_table = gr.components.Dataframe(
                value=df[ON_LOAD_COLS],  # type: ignore
                headers=ON_LOAD_COLS,
                datatype=TYPES,
                elem_id="leaderboard-table",
                interactive=False,
                visible=True,
                column_widths=["2%", "33%"],
            )

            # Dummy leaderboard for handling the case when the user uses backspace key
            hidden_leaderboard_table_for_search = gr.components.Dataframe(
                value=invisible_df[COLS],  # type: ignore
                headers=COLS,
                datatype=TYPES,
                visible=False,
            )
            search_bar.submit(
                update_table,
                [
                    hidden_leaderboard_table_for_search,
                    shown_columns,
                    filter_columns_type,
                    filter_columns_precision,
                    filter_columns_size,
                    search_bar,
                ],
                leaderboard_table,
            )
            for selector in [
                shown_columns,
                filter_columns_type,
                filter_columns_precision,
                filter_columns_size,
            ]:
                selector.change(
                    update_table,
                    [
                        hidden_leaderboard_table_for_search,
                        shown_columns,
                        filter_columns_type,
                        filter_columns_precision,
                        filter_columns_size,
                        search_bar,
                    ],
                    leaderboard_table,
                    queue=True,
                )

if __name__ == "__main__":
    demo.queue(default_concurrency_limit=40).launch()
