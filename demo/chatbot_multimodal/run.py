import gradio as gr
import matplotlib.pyplot as plt
import numpy as np
import plotly.express as px


# Chatbot demo with multimodal input (text, markdown, LaTeX, code blocks, image, audio, & video). Plus shows support for streaming text.

def random_plot():
    df = px.data.iris()
    fig = px.scatter(df, x="sepal_width", y="sepal_length", color="species",
                    size='petal_length', hover_data=['petal_width'])
    return fig

def print_like_dislike(x: gr.LikeData):
    print(x.index, x.value, x.liked)

def add_message(history, message):
    print("history::::: ", history)
    for x in message["files"]:
        history.append(((x,), None))
    if message["text"] is not None:
        history.append((message["text"], None))
    return history, gr.MultimodalTextbox(value=None, interactive=False)

fig = random_plot()
def bot(history):
    # audio = gr.Audio(value="files/cantina.wav")
    # image = gr.Image(value="files/avatar.png")
    # video = gr.Video(value="files/world.mp4")
    fig = random_plot()
    plot = gr.Plot(value=fig),
    history[-1][1] = plot
    return history


with gr.Blocks(fill_height=True) as demo:
    chatbot = gr.Chatbot(
        [["Image", gr.Image(value="files/avatar.png", render=False)],
         ["Video", gr.Video(value="files/world.mp4", render=False)],
         ["Audio", gr.Audio(value="files/cantina.wav", render=False)],
         ["Plot", gr.Plot(value=fig, render=False)],
         ["Gallery", gr.Gallery(value=["files/lion.jpg", "files/cheetah.jpg", "files/zebra.jpg"], render=False)]],
        elem_id="chatbot",
        height=700,
        bubble_full_width=False,
    )

    chat_input = gr.MultimodalTextbox(interactive=True, file_types=["image"], placeholder="Enter message or upload file...", show_label=False)

    chat_msg = chat_input.submit(add_message, [chatbot, chat_input], [chatbot, chat_input])
    bot_msg = chat_msg.then(bot, chatbot, chatbot, api_name="bot_response")
    bot_msg.then(lambda: gr.MultimodalTextbox(interactive=True), None, [chat_input])

    chatbot.like(print_like_dislike, None, None)

demo.queue()
if __name__ == "__main__":
    demo.launch()
