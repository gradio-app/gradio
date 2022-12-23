import gradio as gr
import pypistats
from datetime import date
from dateutil.relativedelta import relativedelta
import pandas as pd

def get_plot(lib, time):
    data = pypistats.overall(lib, total=True, format="pandas")
    data = data.groupby("category").get_group("with_mirrors").sort_values("date")
    start_date = date.today() - relativedelta(months=int(time.split(" ")[0]))
    data = data[(data['date'] > str(start_date))]
    data.date = pd.to_datetime(pd.to_datetime(data.date))
    return gr.LinePlot.update(value=data, x="date", y="downloads",
                              tooltip=['date', 'downloads'],
                              title=f"Pypi downloads of {lib} over last {time}",
                              overlay_point=True,
                              height=400,
                              width=900)


with gr.Blocks() as demo:
    gr.Markdown(
        """
        ## Pypi Download Stats 📈
        See live download stats for all of Hugging Face's open-source libraries 🤗
        """)
    with gr.Row():
        lib = gr.Dropdown(["transformers", "datasets", "huggingface-hub", "gradio", "accelerate"],
                          value="gradio", label="Library")
        time = gr.Dropdown(["3 months", "6 months", "9 months", "12 months"],
                           value="3 months", label="Downloads over the last...")

    plt = gr.LinePlot()
    # You can add multiple event triggers in 2 lines like this
    for event in [lib.change, time.change, demo.load]:
        event(get_plot, [lib, time], [plt])

if __name__ == "__main__":
    demo.launch()
