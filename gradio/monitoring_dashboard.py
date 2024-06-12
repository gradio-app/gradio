import random
import time

import pandas as pd

import gradio as gr

data = {"data": {}}

with gr.Blocks() as demo:
    with gr.Row():
        selected_function = gr.Dropdown(
            ["All"],
            value="All",
            label="Endpoint",
            info="Select the function to see analytics for, or 'All' for aggregate.",
            scale=2,
        )
        demo.load(
            lambda: gr.Dropdown(
                choices=["All"]
                + list({row["function"] for row in data["data"].values()})  # type: ignore
            ),
            None,
            selected_function,
        )
        timespan = gr.Dropdown(
            ["All Time", "24 hours", "1 hours", "10 minutes"],
            value="All Time",
            label="Timespan",
            info="Duration to see data for.",
        )
    with gr.Group():
        with gr.Row():
            unique_users = gr.Label(label="Unique Users")
            unique_requests = gr.Label(label="Unique Requests")
            process_time = gr.Label(label="Avg Process Time")
    plot = gr.BarPlot(
        x="time",
        y="count",
        color="status",
        title="Requests over Time",
        y_title="Requests",
        width=600,
    )

    @gr.on(
        [demo.load, selected_function.change, timespan.change],
        inputs=[selected_function, timespan],
        outputs=[unique_users, unique_requests, process_time, plot],
    )
    def load_dfs(function, timespan):
        df = pd.DataFrame(data["data"].values())
        if df.empty:
            return 0, 0, 0, gr.skip()
        df["time"] = pd.to_datetime(df["time"], unit="s")
        df_filtered = df if function == "All" else df[df["function"] == function]
        if timespan != "All Time":
            df_filtered = df_filtered[
                df_filtered["time"] > pd.Timestamp.now() - pd.Timedelta(timespan)
            ]

        df_filtered["time"] = df_filtered["time"].dt.floor("min")
        plot = df_filtered.groupby(["time", "status"]).size().reset_index(name="count")  # type: ignore
        mean_process_time_for_success = df_filtered[df_filtered["status"] == "success"][
            "process_time"
        ].mean()

        return (
            df_filtered["session_hash"].nunique(),
            df_filtered.shape[0],
            round(mean_process_time_for_success, 2),
            plot,
        )


if __name__ == "__main__":
    data["data"] = {
        random.randint(0, 1000000): {
            "time": time.time() - random.randint(0, 60 * 60 * 24 * 3),
            "status": random.choice(
                ["success", "success", "failure", "pending", "queued"]
            ),
            "function": random.choice(["predict", "chat", "chat"]),
            "process_time": random.randint(0, 10),
            "session_hash": str(random.randint(0, 4)),
        }
        for r in range(random.randint(100, 200))
    }

    demo.launch()
