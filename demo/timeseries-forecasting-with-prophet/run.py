import gradio as gr
import pypistats
from datetime import date
from dateutil.relativedelta import relativedelta
import pandas as pd
from prophet import Prophet
pd.options.plotting.backend = "plotly"

def get_forecast(lib, time):

    data = pypistats.overall(lib, total=True, format="pandas")
    data = data.groupby("category").get_group("with_mirrors").sort_values("date")
    start_date = date.today() - relativedelta(months=int(time.split(" ")[0]))
    df = data[(data['date'] > str(start_date))] 

    df1 = df[['date','downloads']]
    df1.columns = ['ds','y']

    m = Prophet()
    m.fit(df1)
    future = m.make_future_dataframe(periods=90)
    forecast = m.predict(future)
    fig1 = m.plot(forecast)
    return fig1 

with gr.Blocks() as demo:
    gr.Markdown(
    """
    **Pypi Download Stats 📈 with Prophet Forecasting**: see live download stats for popular open-source libraries 🤗 along with a 3 month forecast using Prophet. The [ source code for this Gradio demo is here](https://huggingface.co/spaces/gradio/timeseries-forecasting-with-prophet/blob/main/app.py).
    """)
    with gr.Row():
        lib = gr.Dropdown(["pandas", "scikit-learn", "torch", "prophet"], label="Library", value="pandas")
        time = gr.Dropdown(["3 months", "6 months", "9 months", "12 months"], label="Downloads over the last...", value="12 months")

    plt = gr.Plot()

    lib.change(get_forecast, [lib, time], plt, queue=False)
    time.change(get_forecast, [lib, time], plt, queue=False)    
    demo.load(get_forecast, [lib, time], plt, queue=False)    

demo.launch()