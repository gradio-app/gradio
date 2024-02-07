import gradio as gr
import pypistats
from datetime import date
from dateutil.relativedelta import relativedelta
from darts import TimeSeries
from darts.models import ExponentialSmoothing
from matplotlib import pyplot
import pandas as pd


def get_forecast(lib, time):
    data = pypistats.overall(lib, total=True, format="pandas")
    data = data.groupby("category").get_group("with_mirrors").sort_values("date")
    start_date = date.today() - relativedelta(months=int(time.split(" ")[0]))
    df = data[(data["date"] > str(start_date))]

    df1 = df[["date", "downloads"]]
    df1["date"] = pd.to_datetime(df1["date"])
    df1 = df1.set_index(["date"])

    target = TimeSeries.from_dataframe(df1, freq="D")

    model = ExponentialSmoothing()
    model.fit(target)
    prediction = model.predict(90, num_samples=500)

    fig, axes = pyplot.subplots(figsize=(20, 12))
    target.plot()
    prediction.plot()
    pyplot.legend()
    return fig


with gr.Blocks() as demo:
    gr.Markdown(
        """
    **Pypi Download Stats 📈 with Darts Forecasting**: see live download stats for popular open-source libraries 🤗 along with a 3 month forecast using Darts. The [ source code for this Gradio demo is here](https://huggingface.co/spaces/gradio/timeseries-forecasting-with-darts/blob/main/app.py).
    """
    )
    with gr.Row():
        lib = gr.Dropdown(
            ["pandas", "scikit-learn", "torch", "prophet", "darts"],
            label="Library",
            value="darts",
        )
        time = gr.Dropdown(
            ["3 months", "6 months", "9 months", "12 months"],
            label="Downloads over the last...",
            value="12 months",
        )

    plt = gr.Plot()

    lib.change(get_forecast, [lib, time], plt, queue=False)
    time.change(get_forecast, [lib, time], plt, queue=False)
    demo.load(get_forecast, [lib, time], plt, queue=False)

demo.launch()
