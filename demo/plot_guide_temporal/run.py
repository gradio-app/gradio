import gradio as gr
import pandas as pd
import numpy as np
import random

from datetime import datetime, timedelta
now = datetime.now()

df = pd.DataFrame({
    'time': [now - timedelta(minutes=5*i) for i in range(25)],
    'price': np.random.randint(100, 1000, 25),
    'origin': [random.choice(["DFW", "DAL", "HOU"]) for _ in range(25)],
    'destination': [random.choice(["JFK", "LGA", "EWR"]) for _ in range(25)],
})

with gr.Blocks() as demo:
    gr.LinePlot(df, x="time", y="price")
    gr.ScatterPlot(df, x="time", y="price", color="origin")

if __name__ == "__main__":
    demo.launch()