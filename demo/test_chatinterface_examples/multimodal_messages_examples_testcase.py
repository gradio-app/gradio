import gradio as gr

def generate(
    message: dict,
    chat_history: list[dict],
):

    output = ""
    for character in message['text']:
        output += character
        yield output


demo = gr.ChatInterface(
    fn=generate,
    examples=[
        [{"text": "Hey"}],
        [{"text": "Can you explain briefly to me what is the Python programming language?"}],
    ],
    cache_examples=False,
    type="messages",
    multimodal=True,
)


if __name__ == "__main__":
    demo.launch()
