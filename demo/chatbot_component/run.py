import gradio as gr


def test(x: gr.LikeData):
    print(x.index, x.value, x.liked)


with gr.Blocks() as demo:
    chatbot = gr.Chatbot(
        value=[["Hello World", "Hey Gradio!"], ["❤️", "😍"], ["🔥", "🤗"]]
    )

    chatbot.like(test, None, None)

demo.launch()
