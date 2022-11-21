import gradio as gr
import pandas as pd
import plotly.express as px
from helpers import *


LIBRARIES = ["accelerate", "datasets", "diffusers", "evaluate", "gradio", "hub_docs",
             "huggingface_hub", "optimum", "pytorch_image_models", "tokenizers", "transformers"]


def create_pip_plot(libraries, pip_choices):
    if "Pip" not in pip_choices:
        return gr.update(visible=False)
    output = retrieve_pip_installs(libraries, "Cumulated" in pip_choices)
    df = pd.DataFrame(output).melt(id_vars="day")
    plot = px.line(df, x="day", y="value", color="variable",
                   title="Pip installs")
    plot.update_layout(legend=dict(x=0.5, y=0.99),  title_x=0.5, legend_title_text="")
    return gr.update(value=plot, visible=True)


def create_star_plot(libraries, star_choices):
    if "Stars" not in star_choices:
        return gr.update(visible=False)
    output = retrieve_stars(libraries, "Week over Week" in star_choices)
    df = pd.DataFrame(output).melt(id_vars="day")
    plot = px.line(df, x="day", y="value", color="variable",
                   title="Number of stargazers")
    plot.update_layout(legend=dict(x=0.5, y=0.99),  title_x=0.5, legend_title_text="")
    return gr.update(value=plot, visible=True)


def create_issue_plot(libraries, issue_choices):
    if "Issue" not in issue_choices:
        return gr.update(visible=False)
    output = retrieve_issues(libraries,
                             exclude_org_members="Exclude org members" in issue_choices,
                             week_over_week="Week over Week" in issue_choices)
    df = pd.DataFrame(output).melt(id_vars="day")
    plot = px.line(df, x="day", y="value", color="variable",
                   title="Cumulated number of issues, PRs, and comments",
                   )
    plot.update_layout(legend=dict(x=0.5, y=0.99),  title_x=0.5, legend_title_text="")
    return gr.update(value=plot, visible=True)


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            with gr.Box():
                gr.Markdown("## Select libraries to display")
                libraries = gr.CheckboxGroup(choices=LIBRARIES, label="")
        with gr.Column():
            with gr.Box():
                gr.Markdown("## Select graphs to display")
                pip = gr.CheckboxGroup(choices=["Pip", "Cumulated"], label="")
                stars = gr.CheckboxGroup(choices=["Stars", "Week over Week"], label="")
                issues = gr.CheckboxGroup(choices=["Issue", "Exclude org members", "week over week"], label="")
    with gr.Row():
        fetch = gr.Button(value="Fetch")
    with gr.Row():
        with gr.Column():
            pip_plot = gr.Plot(visible=False)
            star_plot = gr.Plot(visible=False)
            issue_plot = gr.Plot(visible=False)

    fetch.click(create_pip_plot, inputs=[libraries, pip], outputs=pip_plot)
    fetch.click(create_star_plot, inputs=[libraries, stars], outputs=star_plot)
    fetch.click(create_issue_plot, inputs=[libraries, issues], outputs=issue_plot)


if __name__ == "__main__":
    demo.launch()