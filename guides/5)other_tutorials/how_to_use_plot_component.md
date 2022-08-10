# How to Use the Plot Component

Related spaces: https://huggingface.co/spaces/dawood/Plot
Tags: PLOT, IMAGE

## Introduction

Matplotlib, Plotly, and Bokeh are the most popular plotting libraries used in machine learning. Using `gradio`, you can easily build a demo using any of these libraries and share it with anyone. The Gradio plot component accepts any of the following: a `matplotlib.figure.Figure`, a `plotly.graph_objects._figure.Figure`, or a `dict` corresponding to a bokeh plot (json_item format).

This guide will show you how to build a demo for your plot model in a few lines of code; like the one below.

<gradio-app space="dawood/Plot"> </gradio-app>

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started).


## Taking a Look at the Code

Let's take a look at how to create the interface above. First, let's look at the prediction function.

```python
def outbreak(plot_type, r, month, countries, social_distancing):
    months = ["January", "February", "March", "April", "May"]
    m = months.index(month)
    start_day = 30 * m
    final_day = 30 * (m + 1)
    x = np.arange(start_day, final_day + 1)
    pop_count = {"USA": 350, "Canada": 40, "Mexico": 300, "UK": 120}
    if social_distancing:
        r = sqrt(r)
    df = pd.DataFrame({'day': x})
    for country in countries:
        df[country] = ( x ** (r) * (pop_count[country] + 1))
        

    if plot_type == "Matplotlib":
        fig = plt.figure()
        plt.plot(df['day'], df[countries].to_numpy())
        plt.title("Outbreak in " + month)
        plt.ylabel("Cases")
        plt.xlabel("Days since Day 0")
        plt.legend(countries)
        return fig
    elif plot_type == "Plotly":
        fig = px.line(df, x='day', y=countries)
        fig.update_layout(title="Outbreak in " + month,
                   xaxis_title="Cases",
                   yaxis_title="Days Since Day 0")
        return fig
    else:
        source = ColumnDataSource(df)
        p = bk.figure(title="Outbreak in " + month, x_axis_label="Cases", y_axis_label="Days Since Day 0")
        for country in countries:
            p.line(x='day', y=country, line_width=2, source=source)
        item_text = json_item(p, "plotDiv")
        return item_text
```

Alothough this seems like a lot of code, the `outbreak` function is actually quite simple. It takes in the `plot_type` (Matplotlib, Plotly, or Bokeh) as well as a few other parameters to create the plot and returns the plot object based on the library specified by `plot_type`. The if-else statements check the `plot_type` and either return a `matplotlib.figure.Figure`, a `plotly.graph_objects._figure.Figure`, or a `dict` corresponding to a bokeh plot (json_item format). In this interface we allow the option for all three libraries in order to show how all of them can be used. In your own plotting demo feel free to use one.

Now let's take a look at the Gradio specific code to create the interface.

```python
inputs = [
        gr.Dropdown(["Matplotlib", "Plotly", "Bokeh"], label="Plot Type"),
        gr.Slider(1, 4, 3.2, label="R"),
        gr.Dropdown(["January", "February", "March", "April", "May"], label="Month"),
        gr.CheckboxGroup(["USA", "Canada", "Mexico", "UK"], label="Countries", 
                         value=["USA", "Canada"]),
        gr.Checkbox(label="Social Distancing?"),
    ]
outputs = gr.Plot()

demo = gr.Interface(fn=outbreak, inputs=inputs, outputs=outputs, examples=[
        ["Matplotlib", 2, "March", ["Mexico", "UK"], True],
        ["Plotly", 3.6, "February", ["Canada", "Mexico", "UK"], False],
        ["Bokeh", 1.2, "May", ["UK"], True]
    ], cache_examples=True)

demo.launch()
```

Creating the Interface:

* `fn`: the prediction function that is used when the user clicks submit. In our case this is the `outbreak` function.
* `inputs`: a list of inputs including a dropdown menu for selecting which plotting library should be used; as well as other inputs used for plotting the output.
* `outputs`: a plot output component.
* `examples`: list of valid inputs from the 5 input components.
* `cache_examples`: saves the predicted output for the examples, to save time on inference.


## Exploring mode complex Plot Demos:

TODO

----------

And you're done! That's all the code you need to build an interface for your Plot model. Here are some references that you may find useful:

* Gradio's ["Getting Started" guide](https://gradio.app/getting_started/)
* The first [Plot Demo](https://huggingface.co/spaces/dawood/Plot) and [complete code](https://huggingface.co/spaces/dawood/Plot/tree/main) (on Hugging Face Spaces)
