import altair as alt
import gradio as gr
import numpy as np
import pandas as pd
from vega_datasets import data


def make_plot(plot_type):
    if plot_type == "scatter_plot":
        cars = data.cars()
        return alt.Chart(cars).mark_point().encode(
            x='Horsepower',
            y='Miles_per_Gallon',
            color='Origin',
        )
    elif plot_type == "heatmap":
        # Compute x^2 + y^2 across a 2D grid
        x, y = np.meshgrid(range(-5, 5), range(-5, 5))
        z = x ** 2 + y ** 2

        # Convert this grid to columnar data expected by Altair
        source = pd.DataFrame({'x': x.ravel(),
                            'y': y.ravel(),
                            'z': z.ravel()})
        return alt.Chart(source).mark_rect().encode(
            x='x:O',
            y='y:O',
            color='z:Q'
        )
    elif plot_type == "us_map":
        states = alt.topo_feature(data.us_10m.url, 'states')
        source = data.income.url

        return alt.Chart(source).mark_geoshape().encode(
            shape='geo:G',
            color='pct:Q',
            tooltip=['name:N', 'pct:Q'],
            facet=alt.Facet('group:N', columns=2),
        ).transform_lookup(
            lookup='id',
            from_=alt.LookupData(data=states, key='id'),
            as_='geo'
        ).properties(
            width=300,
            height=175,
        ).project(
            type='albersUsa'
        )
    elif plot_type == "interactive_barplot":
        source = data.movies.url

        pts = alt.selection(type="single", encodings=['x'])

        rect = alt.Chart(data.movies.url).mark_rect().encode(
            alt.X('IMDB_Rating:Q', bin=True),
            alt.Y('Rotten_Tomatoes_Rating:Q', bin=True),
            alt.Color('count()',
                scale=alt.Scale(scheme='greenblue'),
                legend=alt.Legend(title='Total Records')
            )
        )

        circ = rect.mark_point().encode(
            alt.ColorValue('grey'),
            alt.Size('count()',
                legend=alt.Legend(title='Records in Selection')
            )
        ).transform_filter(
            pts
        )

        bar = alt.Chart(source).mark_bar().encode(
            x='Major_Genre:N',
            y='count()',
            color=alt.condition(pts, alt.ColorValue("steelblue"), alt.ColorValue("grey"))
        ).properties(
            width=550,
            height=200
        ).add_selection(pts)

        plot = alt.vconcat(
            rect + circ,
            bar
        ).resolve_legend(
            color="independent",
            size="independent"
        )
        return plot
    elif plot_type == "radial":
        source = pd.DataFrame({"values": [12, 23, 47, 6, 52, 19]})

        base = alt.Chart(source).encode(
            theta=alt.Theta("values:Q", stack=True),
            radius=alt.Radius("values", scale=alt.Scale(type="sqrt", zero=True, rangeMin=20)),
            color="values:N",
        )

        c1 = base.mark_arc(innerRadius=20, stroke="#fff")

        c2 = base.mark_text(radiusOffset=10).encode(text="values:Q")

        return c1 + c2
    elif plot_type == "multiline":
        source = data.stocks()

        highlight = alt.selection(type='single', on='mouseover',
                                fields=['symbol'], nearest=True)

        base = alt.Chart(source).encode(
            x='date:T',
            y='price:Q',
            color='symbol:N'
        )

        points = base.mark_circle().encode(
            opacity=alt.value(0)
        ).add_selection(
            highlight
        ).properties(
            width=600
        )

        lines = base.mark_line().encode(
            size=alt.condition(~highlight, alt.value(1), alt.value(3))
        )

        return points + lines


with gr.Blocks() as demo:
    button = gr.Radio(label="Plot type",
                      choices=['scatter_plot', 'heatmap', 'us_map',
                               'interactive_barplot', "radial", "multiline"], value='scatter_plot')
    plot = gr.Plot(label="Plot")
    button.change(make_plot, inputs=button, outputs=[plot])
    demo.load(make_plot, inputs=[button], outputs=[plot])


if __name__ == "__main__":
    demo.launch()
