import random
import time

import pandas as pd

import gradio as gr

data = {"data": {}}

with gr.Blocks() as demo:
    gr.Markdown("# Monitoring Dashboard")
    timer = gr.Timer(5)
    with gr.Row():
        start = gr.DateTime("now - 24h", label="Start Time")
        end = gr.DateTime("now", label="End Time")
        selected_fn = gr.Dropdown(
            ["All"],
            value="All",
            label="Endpoint",
            info="Select the function to see analytics for, or 'All' for aggregate.",
        )
        demo.load(
            lambda: gr.Dropdown(
                choices=["All"]
                + list({row["function"] for row in data["data"].values()})  # type: ignore
            ),
            None,
            selected_fn,
        )

    with gr.Group():
        with gr.Row():
            unique_users = gr.Label(label="Unique Users")
            total_requests = gr.Label(label="Total Requests")
            process_time = gr.Label(label="Avg Process Time")

    plot = gr.BarPlot(
        x="time",
        y="function",
        color="status",
        title="Requests over Time",
        y_title="Requests",
        x_bin="1m",
        y_aggregate="count",
        color_map={
            "success": "#22c55e",
            "failure": "#ef4444",
            "pending": "#eab308",
            "queued": "#3b82f6",
        },
    )

    @gr.on(
        [demo.load, timer.tick, start.change, end.change, selected_fn.change],
        inputs=[start, end, selected_fn],
        outputs=[plot, unique_users, total_requests, process_time],
    )
    def gen_plot(start, end, selected_fn):
        if len(data["data"]) == 0:
            return {plot: gr.skip()}
        df = pd.DataFrame(list(data["data"].values()))
        if selected_fn != "All":
            df = df[df["function"] == selected_fn]
        df = df[(df["time"] >= start) & (df["time"] <= end)]
        df["time"] = pd.to_datetime(df["time"], unit="s")  # type: ignore

        unique_users = len(df["session_hash"].unique())  # type: ignore
        total_requests = len(df)
        process_time = round(df["process_time"].mean(), 2)

        duration = end - start
        x_bin = (
            "1h"
            if duration >= 60 * 60 * 24
            else "15m"
            if duration >= 60 * 60 * 3
            else "1m"
        )
        df = df.drop(columns=["session_hash"])  # type: ignore
        assert isinstance(df, pd.DataFrame)  # noqa: S101
        return (
            gr.BarPlot(value=df, x_bin=x_bin, x_lim=[start, end]),
            unique_users,
            total_requests,
            process_time,
        )


if __name__ == "__main__":
    data["data"] = {}
    for _ in range(random.randint(300, 500)):
        timedelta = random.randint(0, 60 * 60 * 24 * 3)
        data["data"][random.randint(1, 100000)] = {
            "time": time.time() - timedelta,
            "status": random.choice(
                ["success", "success", "failure"]
                if timedelta > 30 * 60
                else ["queued", "pending"]
            ),
            "function": random.choice(["predict", "chat", "chat"]),
            "process_time": random.randint(0, 10),
            "session_hash": str(random.randint(0, 4)),
        }

    demo.launch()
