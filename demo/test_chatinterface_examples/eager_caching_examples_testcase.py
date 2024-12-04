import gradio as gr

def generate(
    message: str,
    chat_history: list[dict],
):

    output = ""
    for character in message:
        output += character
        yield output


demo = gr.ChatInterface(
    fn=generate,
    examples=[
        ["Hey"],
        ["Can you explain briefly to me what is the Python programming language?"],
    ],
    cache_examples=True,
    cache_mode="eager",
    type="messages",
)


if __name__ == "__main__":
    demo.launch()
