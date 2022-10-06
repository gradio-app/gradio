import gradio as gr
import pandas as pd
import plotly.graph_objects as go

df = pd.read_csv("AB_NYC_2019.csv")

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
        map = gr.Plot().style()
    demo.load(filter_map, [min_price, max_price, boroughs], map)
    btn.click(filter_map, [min_price, max_price, boroughs], map)

demo.launch()