# type: ignore
import gradio as gr
import os
import plotly.express as px
import random

# Chatbot demo with multimodal input (text, markdown, LaTeX, code blocks, image, audio, video, & model3d). Plus shows support for streaming text.

txt = """
Absolutely! The mycorrhizal network, often referred to as the "Wood Wide Web," is a symbiotic association between fungi and the roots of most plant species. Here’s a deeper dive into how it works and its implications:

### How It Works

1. **Symbiosis**: Mycorrhizal fungi attach to plant roots, extending far into the soil. The plant provides the fungi with carbohydrates produced via photosynthesis. In return, the fungi help the plant absorb water and essential nutrients like phosphorus and nitrogen from the soil.

2. **Network Formation**: The fungal hyphae (thread-like structures) connect individual plants, creating an extensive underground network. This network can link many plants together, sometimes spanning entire forests.

3. **Communication**: Trees and plants use this network to communicate and share resources. For example, a tree under attack by pests can send chemical signals through the mycorrhizal network to warn neighboring trees. These trees can then produce defensive chemicals to prepare for the impending threat.

### Benefits and Functions

1. **Resource Sharing**: The network allows for the redistribution of resources among plants. For instance, a large, established tree might share excess nutrients and water with smaller, younger trees, promoting overall forest health.

2. **Defense Mechanism**: The ability to share information about pests and diseases enhances the resilience of plant communities. This early warning system helps plants activate their defenses before they are directly affected.

3. **Support for Seedlings**: Young seedlings, which have limited root systems, benefit immensely from the mycorrhizal network. They receive nutrients and water from larger plants, increasing their chances of survival and growth.

### Ecological Impact

1. **Biodiversity**: The mycorrhizal network supports biodiversity by fostering a cooperative environment. Plants of different species can coexist and thrive because of the shared resources and information.

2. **Forest Health**: The network enhances the overall health of forests. By enabling efficient nutrient cycling and supporting plant defenses, it contributes to the stability and longevity of forest ecosystems.

3. **Climate Change Mitigation**: Healthy forests act as significant carbon sinks, absorbing carbon dioxide from the atmosphere. The mycorrhizal network plays a critical role in maintaining forest health and, consequently, in mitigating climate change.

### Research and Discoveries

1. **Suzanne Simard's Work**: Ecologist Suzanne Simard’s research has been pivotal in uncovering the complexities of the mycorrhizal network. She demonstrated that trees of different species can share resources and that "mother trees" (large, older trees) play a crucial role in nurturing younger plants.

2. **Implications for Conservation**: Understanding the mycorrhizal network has significant implications for conservation efforts. It highlights the importance of preserving not just individual trees but entire ecosystems, including the fungal networks that sustain them.

### Practical Applications

1. **Agriculture**: Farmers and horticulturists are exploring the use of mycorrhizal fungi to improve crop yields and soil health. By incorporating these fungi into agricultural practices, they can reduce the need for chemical fertilizers and enhance plant resilience.

2. **Reforestation**: In reforestation projects, introducing mycorrhizal fungi can accelerate the recovery of degraded lands. The fungi help establish healthy plant communities, ensuring the success of newly planted trees.

The "Wood Wide Web" exemplifies the intricate and often hidden connections that sustain life on Earth. It’s a reminder of the profound interdependence within natural systems and the importance of preserving these delicate relationships.
"""

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

color_map = {
    "harmful": "crimson",
    "neutral": "gray",
    "beneficial": "green",
}

def html_src(harm_level):
    return f"""
<div style="display: flex; gap: 5px;">
  <div style="background-color: {color_map[harm_level]}; padding: 2px; border-radius: 5px;">
  {harm_level}
  </div>
</div>
"""

def print_like_dislike(x: gr.LikeData):
    print(x.index, x.value, x.liked)

def random_bokeh_plot():
    from bokeh.models import ColumnDataSource, Whisker
    from bokeh.plotting import figure
    from bokeh.sampledata.autompg2 import autompg2 as df
    from bokeh.transform import factor_cmap, jitter

    classes = sorted(df["class"].unique())

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
        history.append({"role": "user", "content": {"path": x}})
    if message["text"] is not None:
        history.append({"role": "user", "content": message["text"]})
    return history, gr.MultimodalTextbox(value=None, interactive=False)

def bot(history, response_type):
    msg = {"role": "assistant", "content": ""}
    if response_type == "plot":
        content = gr.Plot(random_plot())
    elif response_type == "bokeh_plot":
        content = gr.Plot(random_bokeh_plot())
    elif response_type == "matplotlib_plot":
        content =  gr.Plot(random_matplotlib_plot())
    elif response_type == "gallery":
        content = gr.Gallery(
            [os.path.join("files", "avatar.png"), os.path.join("files", "avatar.png")]
        )
    elif response_type == "dataframe":
        content = gr.Dataframe(
            interactive=True,
            headers=["One", "Two", "Three"],
            col_count=(3, "fixed"),
            row_count=(3, "fixed"),
            value=[[1, 2, 3], [4, 5, 6], [7, 8, 9]],
            label="Dataframe",
        )
    elif response_type == "image":
       content = gr.Image(os.path.join("files", "avatar.png"))
    elif response_type == "video":
       content = gr.Video(os.path.join("files", "world.mp4"))
    elif response_type == "audio":
        content = gr.Audio(os.path.join("files", "audio.wav"))
    elif response_type == "audio_file":
        content = {"path": os.path.join("files", "audio.wav"), "alt_text": "description"}
    elif response_type == "image_file":
        content = {"path": os.path.join("files", "avatar.png"), "alt_text": "description"}
    elif response_type == "video_file":
        content = {"path": os.path.join("files", "world.mp4"), "alt_text": "description"}
    elif response_type == "txt_file":
        content = {"path": os.path.join("files", "sample.txt"), "alt_text": "description"}
    elif response_type == "model3d_file":
        content = {"path": os.path.join("files", "Duck.glb"), "alt_text": "description"}
    elif response_type == "html":
        content = gr.HTML(
            html_src(random.choice(["harmful", "neutral", "beneficial"]))
        )
    elif response_type == "model3d":
        content = gr.Model3D(os.path.join("files", "Duck.glb"))
    else:
        content = txt
    msg["content"] = content # type: ignore
    history.append(msg)
    return history

fig = random_plot()

with gr.Blocks(fill_height=True) as demo:
    chatbot = gr.Chatbot(
        elem_id="chatbot",
        type="messages",
        bubble_full_width=False,
        scale=1,
        show_copy_button=True,
        avatar_images=(
            None,  # os.path.join("files", "avatar.png"),
            os.path.join("files", "avatar.png"),
        ),
    )
    response_type = gr.Radio(
        [
            "audio_file",
            "image_file",
            "video_file",
            "txt_file",
            "model3d_file",
            "plot",
            "matplotlib_plot",
            "bokeh_plot",
            "image",
            "text",
            "gallery",
            "dataframe",
            "video",
            "audio",
            "html",
            "model3d",
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

if __name__ == "__main__":
    demo.launch()
