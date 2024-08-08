# Filters, Tables and Stats

Your dashboard will likely consist of more than just plots. Let's take a look at some of the other common components of a dashboard.

## Filters

Use any of the standard Gradio form components to filter your data. You can do this via event listeners or function-as-value syntax. Let's look at the event listener approach first:

$code_plot_guide_filters_events
$demo_plot_guide_filters_events

And this would be the function-as-value approach for the same demo.

$code_plot_guide_filters

## Tables and Stats

Add `gr.DataFrame` and `gr.Label` to your dashboard for some hard numbers.

$code_plot_guide_tables_stats
$demo_plot_guide_tables_stats
