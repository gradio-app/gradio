import gradio as gr
from data import temp_sensor_data, food_rating_data

with gr.Blocks() as scatter_plots:
    with gr.Row():
        start = gr.DateTime("2021-01-01 00:00:00", label="Start")
        end = gr.DateTime("2021-01-05 00:00:00", label="End")
        apply_btn = gr.Button("Apply", scale=0)
    with gr.Row():
        group_by = gr.Radio(["None", "30m", "1h", "4h", "1d"], value="None", label="Group by")
        aggregate = gr.Radio(["sum", "mean", "median", "min", "max"], value="sum", label="Aggregation")

    temp_by_time = gr.ScatterPlot(
        temp_sensor_data,
        x="time",
        y="temperature",
    )
    temp_by_time_location = gr.ScatterPlot(
        temp_sensor_data,
        x="time",
        y="temperature",
        color="location",
    )

    time_graphs = [temp_by_time, temp_by_time_location]
    group_by.change(
        lambda group: [gr.ScatterPlot(x_bin=None if group == "None" else group)] * len(time_graphs),
        group_by,
        time_graphs
    )
    aggregate.change(
        lambda aggregate: [gr.ScatterPlot(y_aggregate=aggregate)] * len(time_graphs),
        aggregate,
        time_graphs
    )

    # def rescale(select: gr.SelectData):
    #     return select.index
    # rescale_evt = gr.on([plot.select for plot in time_graphs], rescale, None, [start, end])

    # for trigger in [apply_btn.click, rescale_evt.then]:
    #     trigger(
    #         lambda start, end: [gr.ScatterPlot(x_lim=[start, end])] * len(time_graphs), [start, end], time_graphs
    #     )

    price_by_cuisine = gr.ScatterPlot(
        food_rating_data,
        x="cuisine",
        y="price",
    )
    with gr.Row():
        price_by_rating = gr.ScatterPlot(
            food_rating_data,
            x="rating",
            y="price",
            color="wait",
            show_actions_button=True,
        )
        price_by_rating_color = gr.ScatterPlot(
            food_rating_data,
            x="rating",
            y="price",
            color="cuisine",
            # color_map={"Italian": "red", "Mexican": "green", "Chinese": "blue"},
        )

if __name__ == "__main__":
    scatter_plots.launch()
