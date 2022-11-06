# How to Use the Plot Component for Maps

Related spaces: 
Tags: PLOTS, MAPS

## Introduction

This guide explains how you can use Gradio to plot geographical data on a map using the `gradio.Plot` component. The Gradio `Plot` component works with Matplotlib, Bokeh and Plotly. Plotly is what we will be working with in this guide. Plotly allows developers to easily create all sorts of maps with their geographical data. Take a look [here](https://plotly.com/python/maps/) for some examples.

## Overview 
    
We will be using the New York City Airbnb dataset, which is hosted on kaggle [here](https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data). I've uploaded it to the Hugging Face Hub as a dataset [here](https://huggingface.co/datasets/gradio/NYC-Airbnb-Open-Data) for easier use and download. Using this data we will plot Airbnb locations on a map output and allow filtering based on price and location. Below is the demo that we will be buiding. ⚡️

<gradio-app space="gradio/NYC-Airbnb-Map"> </gradio-app>


## Step 1 - Loading CSV data 💾

Let's start by loading the Airbnb NYC data from the Hugging Face Hub.

```python
import pandas as pd

dataset = load_dataset("gradio/NYC-Airbnb-Open-Data", split="train")
df = dataset.to_pandas()

def filter_map(min_price, max_price, boroughs):
    new_df = df[(df['neighbourhood_group'].isin(boroughs)) & 
            (df['price'] > min_price) & (df['price'] < max_price)]
    names = df["name"].tolist()
    prices = df["price"].tolist()
    text_list = [(names[i], prices[i]) for i in range(0, len(names))]
```

In the code above, we first load the csv data into a pandas dataframe. Let's begin by defining a function that we will use as the prediction fuction for the gradio app. This function will accept the minimum price and maximum price range as well as the list of boroughs to filter the resulting map. We can use the passed in values (`min_price`, `max_price`, and list of `boroughs`) to filter the dataframe and create `new_df`. Next we will create `text_list` of the names and prices of each Airbnb to use as labels on the map.
 
## Step 2 - Map Figure 🌐

Plotly makes it easy to work with maps. Let's take a look below how we can create a map figure.

```python
import plotly.graph_objects as go

fig = go.Figure(go.Scattermapbox(
            customdata=text_list,
            lat=new_df['latitude'].tolist(),
            lon=new_df['longitude'].tolist(),
            mode='markers',
            marker=go.scattermapbox.Marker(
                size=6
            ),
            hoverinfo="text",
            hovertemplate='<b>Name</b>: %{customdata[0]}<br><b>Price</b>: $%{customdata[1]}'
        ))

fig.update_layout(
    mapbox_style="open-street-map",
    hovermode='closest',
    mapbox=dict(
        bearing=0,
        center=go.layout.mapbox.Center(
            lat=40.67,
            lon=-73.90
        ),
        pitch=0,
        zoom=9
    ),
)
```

Above, we create a scatter plot on mapbox by passing it our list of latitudes and longitudes to plot markers.  We also pass in our custom data of names and prices for additional info to appear on every marker we hover over. Next we use `update_layout` to specify other map settings such as zoom, and centering.

More info [here](https://plotly.com/python/scattermapbox/) on scatter plots using Mapbox and Plotly.


## Step 3 - Gradio App ⚡️
We will use two `gradio.Number` components and a `gradio.CheckboxGroup` to allow users of our app to specify price ranges and borough locations. We will then use the `gr.Plot` component as an output for our Plotly + Mapbox map we created earlier.

```python
with gr.Blocks() as demo:
    with gr.Column():
        with gr.Row():
            min_price = gr.Number(value=250, label="Minimum Price")
            max_price = gr.Number(value=1000, label="Maximum Price")
        boroughs = gr.CheckboxGroup(choices=["Queens", "Brooklyn", "Manhattan", "Bronx", "Staten Island"], value=["Queens", "Brooklyn"], label="Select Boroughs:")
        btn = gr.Button(value="Update Filter")
        map = gr.Plot()
    demo.load(filter_map, [min_price, max_price, boroughs], map)
    btn.click(filter_map, [min_price, max_price, boroughs], map)
```

We layout these components using the `gr.Column` and `gr.Row` and wel also add event triggers for when the demo first loads and when our "Update Filter" button is clicked in order to trigger the map to update with our new filters.

This is what the full demo code looks like:

```python
import os
import gradio as gr
import pandas as pd
import plotly.graph_objects as go

dataset = load_dataset("gradio/NYC-Airbnb-Open-Data", split="train")
df = dataset.to_pandas()

def filter_map(min_price, max_price, boroughs):

    new_df = df[(df['neighbourhood_group'].isin(boroughs)) & 
          (df['price'] > min_price) & (df['price'] < max_price)]
    names = df["name"].tolist()
    prices = df["price"].tolist()
    text_list = [(names[i], prices[i]) for i in range(0, len(names))]
    fig = go.Figure(go.Scattermapbox(
            customdata=text_list,
            lat=new_df['latitude'].tolist(),
            lon=new_df['longitude'].tolist(),
            mode='markers',
            marker=go.scattermapbox.Marker(
                size=6
            ),
            hoverinfo="text",
            hovertemplate='<b>Name</b>: %{customdata[0]}<br><b>Price</b>: $%{customdata[1]}'
        ))

    fig.update_layout(
        mapbox_style="open-street-map",
        hovermode='closest',
        mapbox=dict(
            bearing=0,
            center=go.layout.mapbox.Center(
                lat=40.67,
                lon=-73.90
            ),
            pitch=0,
            zoom=9
        ),
    )

    return fig

with gr.Blocks() as demo:
    with gr.Column():
        with gr.Row():
            min_price = gr.Number(value=250, label="Minimum Price")
            max_price = gr.Number(value=1000, label="Maximum Price")
        boroughs = gr.CheckboxGroup(choices=["Queens", "Brooklyn", "Manhattan", "Bronx", "Staten Island"], value=["Queens", "Brooklyn"], label="Select Boroughs:")
        btn = gr.Button(value="Update Filter")
        map = gr.Plot()
    demo.load(filter_map, [min_price, max_price, boroughs], map)
    btn.click(filter_map, [min_price, max_price, boroughs], map)

demo.launch()
```

## Step 4 - Deployment 🤗
If you run the code above, your app will start running locally.
You can even get a temporary shareable link by passing the `share=True` parameter to `launch`.

But what if you want to a permanent deployment solution?
Let's deploy our Gradio app to the free HuggingFace Spaces platform.

If you haven't used Spaces before, follow the previous guide [here](/using_hugging_face_integrations).

## Conclusion 🎉
And you're all done! That's all the code you need to build a map demo.

Here's a link to the demo [Map demo](https://huggingface.co/spaces/gradio/NYC-Airbnb-Map) and [complete code](https://huggingface.co/spaces/gradio/NYC-Airbnb-Map/blob/main/app.py) (on Hugging Face Spaces)
