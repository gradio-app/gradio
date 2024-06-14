import gradio as gr
import os
import plotly.express as px

# Chatbot demo with multimodal input (text, markdown, LaTeX, code blocks, image, audio, & video). Plus shows support for streaming text.


def random_plot():
    df = px.data.iris()
    fig = px.scatter(
        df,
        x="sepal_width",
        y="sepal_length",
        color="species",
        size="petal_length",
        hover_data=["petal_width"],
    )
    return fig


def print_like_dislike(x: gr.LikeData):
    print(x.index, x.value, x.liked)


def random_bokeh_plot():
    from bokeh.models import ColumnDataSource, Whisker
    from bokeh.plotting import figure
    from bokeh.sampledata.autompg2 import autompg2 as df
    from bokeh.transform import factor_cmap, jitter, factor_mark

    classes = list(sorted(df["class"].unique()))

    p = figure(
        height=400,
        x_range=classes,
        background_fill_color="#efefef",
        title="Car class vs HWY mpg with quintile ranges",
    )
    p.xgrid.grid_line_color = None

    g = df.groupby("class")
    upper = g.hwy.quantile(0.80)
    lower = g.hwy.quantile(0.20)
    source = ColumnDataSource(data=dict(base=classes, upper=upper, lower=lower))

    error = Whisker(
        base="base",
        upper="upper",
        lower="lower",
        source=source,
        level="annotation",
        line_width=2,
    )
    error.upper_head.size = 20
    error.lower_head.size = 20
    p.add_layout(error)

    p.circle(
        jitter("class", 0.3, range=p.x_range),
        "hwy",
        source=df,
        alpha=0.5,
        size=13,
        line_color="white",
        color=factor_cmap("class", "Light6", classes),
    )
    return p


def random_matplotlib_plot():
    import numpy as np
    import pandas as pd
    import matplotlib.pyplot as plt

    countries = ["USA", "Canada", "Mexico", "UK"]
    months = ["January", "February", "March", "April", "May"]
    m = months.index("January")
    r = 3.2
    start_day = 30 * m
    final_day = 30 * (m + 1)
    x = np.arange(start_day, final_day + 1)
    pop_count = {"USA": 350, "Canada": 40, "Mexico": 300, "UK": 120}
    df = pd.DataFrame({"day": x})
    for country in countries:
        df[country] = x ** (r) * (pop_count[country] + 1)

    fig = plt.figure()
    plt.plot(df["day"], df[countries].to_numpy())
    plt.title("Outbreak in " + "January")
    plt.ylabel("Cases")
    plt.xlabel("Days since Day 0")
    plt.legend(countries)
    return fig


def add_message(history, message):
    for x in message["files"]:
        history.append(((x,), None))
    if message["text"] is not None:
        history.append((message["text"], None))
    return history, gr.MultimodalTextbox(value=None, interactive=False)


def bot(history, response_type):
    if response_type == "plot":
        history[-1][1] = gr.Plot(random_plot())
    elif response_type == "bokeh_plot":
        history[-1][1] = gr.Plot(random_bokeh_plot())
    elif response_type == "matplotlib_plot":
        history[-1][1] = gr.Plot(random_matplotlib_plot())
    elif response_type == "gallery":
        history[-1][1] = gr.Gallery(
            [os.path.join("files", "avatar.png"), os.path.join("files", "avatar.png")]
        )
    elif response_type == "image":
        history[-1][1] = gr.Image(os.path.join("files", "avatar.png"))
    elif response_type == "video":
        history[-1][1] = gr.Video(os.path.join("files", "world.mp4"))
    elif response_type == "audio":
        history[-1][1] = gr.Audio(os.path.join("files", "audio.wav"))
    elif response_type == "audio_file":
        history[-1][1] = (os.path.join("files", "audio.wav"), "description")
    elif response_type == "image_file":
        history[-1][1] = (os.path.join("files", "avatar.png"), "description")
    elif response_type == "video_file":
        history[-1][1] = (os.path.join("files", "world.mp4"), "description")
    elif response_type == "txt_file":
        history[-1][1] = (os.path.join("files", "sample.txt"), "description")
    else:
        history[-1][1] = "Cool!"
    return history


fig = random_plot()

with gr.Blocks(fill_height=True) as demo:
    chatbot = gr.Chatbot(
        elem_id="chatbot",
        bubble_full_width=False,
        scale=1,
    )
    response_type = gr.Radio(
        [
            "audio_file",
            "image_file",
            "video_file",
            "txt_file",
            "plot",
            "matplotlib_plot",
            "bokeh_plot",
            "image",
            "text",
            "gallery",
            "video",
            "audio",
        ],
        value="text",
        label="Response Type",
    )

    chat_input = gr.MultimodalTextbox(
        interactive=True,
        placeholder="Enter message or upload file...",
        show_label=False,
    )

    chat_msg = chat_input.submit(
        add_message, [chatbot, chat_input], [chatbot, chat_input]
    )
    bot_msg = chat_msg.then(
        bot, [chatbot, response_type], chatbot, api_name="bot_response"
    )
    bot_msg.then(lambda: gr.MultimodalTextbox(interactive=True), None, [chat_input])

    chatbot.like(print_like_dislike, None, None)

demo.queue()
if __name__ == "__main__":
    demo.launch()
