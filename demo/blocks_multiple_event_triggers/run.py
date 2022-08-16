import gradio as gr
import pypistats
from datetime import date
from dateutil.relativedelta import relativedelta
import pandas as pd

pd.options.plotting.backend = "plotly"


def get_plot(lib, time):
    data = pypistats.overall(lib, total=True, format="pandas")
    data = data.groupby("category").get_group("with_mirrors").sort_values("date")
    start_date = date.today() - relativedelta(months=int(time.split(" ")[0]))
    data = data[(data['date'] > str(start_date))]
    chart = data.plot(x="date", y="downloads")
    return chart


with gr.Blocks() as demo:
    gr.Markdown(
        """
        ## Pypi Download Stats 📈
        See live download stats for all of Hugging Face's open-source libraries 🤗
        """)
    with gr.Row():
        lib = gr.Dropdown(["transformers", "datasets", "huggingface-hub", "gradio", "accelerate"], label="Library")
        time = gr.Dropdown(["3 months", "6 months", "9 months", "12 months"], label="Downloads over the last...")

    plt = gr.Plot()
    # You can add multiple event triggers in 2 lines like this
    for event in [lib.change, time.change]:
        event(get_plot, [lib, time], [plt])

if __name__ == "__main__":
    demo.launch()
