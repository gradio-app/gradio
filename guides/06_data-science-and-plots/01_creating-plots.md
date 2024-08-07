# Creating Plots

Gradio is a great way to create extremely customizable dashboards. Gradio comes with three native Plot components: `gr.LinePlot`, `gr.ScatterPlot` and `gr.BarPlot`. All these plots have the same API. Let's take a look how to set them up.

## Creating a Plot with a pd.Dataframe

Plots accept a pandas Dataframe as their value. The plot also takes `x` and `y` which represent the names of the columns that represent the x and y axes respectively. Here's a simple example:

$code_plot_guide_line
$demo_plot_guide_line

All plots have the same API, so you could swap this out with a `gr.ScatterPlot`:

$code_plot_guide_scatter
$demo_plot_guide_scatter

The y axis column in the dataframe should have a numeric type, but the x axis column can be anything from strings, numbers, categories, or datetimes.

$code_plot_guide_scatter_nominal
$demo_plot_guide_scatter_nominal

## Breaking out Series by Color

You can break out your plot into series using the `color` argument.

$code_plot_guide_series_nominal
$demo_plot_guide_series_nominal

If you wish to assign series specific colors, use the `color_map` arg, e.g. `gr.ScatterPlot(..., color_map={'white': '#FF9988', 'asian': '#88EEAA', 'black': '#333388'})`

The color column can be numeric type as well.

$code_plot_guide_series_quantitative
$demo_plot_guide_series_quantitative

## Aggregating Values

You can aggregate values into groups using the `x_bin` and `y_aggregate` arguments. If your x-axis is numeric, providing an `x_bin` will create a histogram-style binning:

$code_plot_guide_aggregate_quantitative
$demo_plot_guide_aggregate_quantitative

If your x-axis is a string type instead, they will act as the category bins automatically:

$code_plot_guide_aggregate_nominal
$demo_plot_guide_aggregate_nominal

## Selecting Regions

You can use the `.select` listener to select regions of a plot. Click and drag on the plot below to select part of the plot.

$code_plot_guide_selection
$demo_plot_guide_selection

You can combine this and the `.double_click` listener to create some zoom in/out effects by changing `x_lim` which sets the bounds of the x-axis:

$code_plot_guide_zoom
$demo_plot_guide_zoom

If you had multiple plots with the same x column, your event listeners could target the x limits of all other plots so that the x-axes stay in sync.

$code_plot_guide_zoom_sync
$demo_plot_guide_zoom_sync

## Making an Interactive Dashboard

Take a look how you can have an interactive dashboard where the plots are functions of other Components.

$code_plot_guide_interactive
$demo_plot_guide_interactive

It's that simple to filter and control the data presented in your visualization!