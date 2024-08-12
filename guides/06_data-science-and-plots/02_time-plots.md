# Time Plots

Creating visualizations with a time x-axis is a common use case. Let's dive in!

## Creating a Plot with a pd.Dataframe

Time plots need a datetime column on the x-axis. Here's a simple example with some flight data:

$code_plot_guide_temporal
$demo_plot_guide_temporal

## Aggregating by Time

You may wish to bin data by time buckets. Use `x_bin` to do so, using a string suffix with "s", "m", "h" or "d", such as "15m" or "1d".

$code_plot_guide_aggregate_temporal
$demo_plot_guide_aggregate_temporal

## DateTime Components

You can use `gr.DateTime` to accept input datetime data. This works well with plots for defining the x-axis range for the data.

$code_plot_guide_datetime
$demo_plot_guide_datetime

Note how `gr.DateTime` can accept a full datetime string, or a shorthand using `now - [0-9]+[smhd]` format to refer to a past time.

You will often have many time plots in which case you'd like to keep the x-axes in sync. The `DateTimeRange` custom component keeps a set of datetime plots in sync, and also uses the `.select` listener of plots to allow you to zoom into plots while keeping plots in sync. 

Because it is a custom component, you first need to `pip install gradio_datetimerange`. Then run the following:

$code_plot_guide_datetimerange
$demo_plot_guide_datetimerange

Try zooming around in the plots and see how DateTimeRange updates. All the plots updates their `x_lim` in sync. You also have a "Back" link in the component to allow you to quickly zoom in and out.

## RealTime Data

In many cases, you're working with live, realtime date, not a static dataframe. In this case, you'd update the plot regularly with a `gr.Timer()`. Assuming there's a `get_data` method that gets the latest dataframe:

```python
with gr.Blocks() as demo:
    timer = gr.Timer(5)
    plot1 = gr.BarPlot(x="time", y="price")
    plot2 = gr.BarPlot(x="time", y="price", color="origin")

    timer.tick(lambda: [get_data(), get_data()], outputs=[plot1, plot2])
```

You can also use the `every` shorthand to attach a `Timer` to a component that has a function value:

```python
with gr.Blocks() as demo:
    timer = gr.Timer(5)
    plot1 = gr.BarPlot(get_data, x="time", y="price", every=timer)
    plot2 = gr.BarPlot(get_data, x="time", y="price", color="origin", every=timer)
```


