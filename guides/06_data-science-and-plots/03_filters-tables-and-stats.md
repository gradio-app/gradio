# Filters, Tables and Stats

Your dashboard will likely consist of more than just plots. Let's take a look at some of the other common components of a dashboard.

## Filters

Use any of the standard Gradio form components to filter your data. Because the dataframe is not static, we'll use function-as-value format for the LinePlot value.

$code_plot_guide_filters
$demo_plot_guide_filters

## Tables and Stats

Add `gr.DataFrame` and `gr.Label` to your dashboard for some hard numbers.

$code_plot_guide_tables_stats
$demo_plot_guide_tables_stats
