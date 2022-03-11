from black import out
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

import plotly.express as px
from bokeh.plotting import figure, show
import gradio as gr
from math import sqrt
import numpy as np


def plotly_test(text):
    fig = px.scatter(x=[0, 1, 2, 3, 4], y=[0, 1, 4, 9, 16])
    return fig

def bokeh_test(text):
  # prepare some data
  x = [1, 2, 3, 4, 5]
  y1 = [6, 7, 2, 4, 5]
  y2 = [2, 3, 4, 5, 6]
  y3 = [4, 5, 5, 7, 2]

  # create a new plot with a title and axis labels
  fig = figure(title="Multiple glyphs example", x_axis_label="x", y_axis_label="y")

  # add multiple renderers
  fig.line(x, y1, legend_label="Temp.", color="blue", line_width=2)
  fig.line(x, y2, legend_label="Rate", color="red", line_width=2)
  fig.circle(x, y3, legend_label="Objects", color="yellow", size=12)
  return fig

def matplotlib(text):
   xpoints = np.array([0, 6])
   ypoints = np.array([0, 250])
   plt.plot(xpoints, ypoints)
   return plt


iface = gr.Interface(
    plotly_test, "text", gr.outputs.Plot(type="matplotlib")
)

if __name__ == "__main__":
    iface.launch()
