import gradio as gr
from data import df

with gr.Blocks() as demo:
    with gr.Row():
        ethnicity = gr.Dropdown(["all", "white", "black", "asian"], value="all")
        max_age = gr.Slider(18, 65, value=65)

    def filtered_df(ethnic, age):
        _df = df if ethnic == "all" else df[df["ethnicity"] == ethnic]
        _df = _df[_df["age"] < age]
        return _df

    gr.ScatterPlot(filtered_df, inputs=[ethnicity, max_age], x="weight", y="height", title="Weight x Height")
    gr.LinePlot(filtered_df, inputs=[ethnicity, max_age], x="age", y="height", title="Age x Height")

if __name__ == "__main__":
    demo.launch()