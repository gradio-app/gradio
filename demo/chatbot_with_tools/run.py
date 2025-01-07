import gradio as gr
import time
from gradio import ChatMessage
from gradio.components.chatbot import Metadata

def generate_response(history):
    history.append(
        ChatMessage(role="user", content="What is 27 * 14?")
    )
    yield history
    time.sleep(0.5)

    history.append(
        ChatMessage(
            role="assistant",
            content="Let me break this down step by step.",
            metadata=Metadata(id=1, title="Solving multiplication", parent_id=0)
        )
    )
    yield history
    time.sleep(0.5)

    history.append(
        ChatMessage(
            role="assistant",
            content="First, let's multiply 27 by 10: 27 * 10 = 270",
            metadata=Metadata(id=2, title="Step 1", parent_id=1)
        )
    )
    yield history
    time.sleep(0.25)

    history.append(
        ChatMessage(
            role="assistant",
            content="We can do this quickly because multiplying by 10 just adds a zero",
            metadata=Metadata(id=6, title="Quick Tip", parent_id=2)
        )
    )
    yield history
    time.sleep(0.25)

    history.append(
        ChatMessage(
            role="assistant",
            content="Then multiply 27 by 4: 27 * 4 = 108",
            metadata=Metadata(id=3, title="Step 2", parent_id=1)
        )
    )
    yield history
    time.sleep(0.5)

    history.append(
        ChatMessage(
            role="assistant",
            content="Adding these together: 270 + 108 = 378. Therefore, 27 * 14 = 378"
        )
    )
    yield history
    time.sleep(0.25)

    history.append(
        ChatMessage(
            role="assistant",
            content="Let me verify this result using a different method.",
            metadata=Metadata(id=4, title="Verification")
        )
    )
    yield history
    time.sleep(0.25)

    history.append(
        ChatMessage(
            role="assistant",
            content="Using the standard algorithm: 27 * 14 = (20 + 7) * (10 + 4)",
            metadata=Metadata(id=5, title="Expanding", parent_id=4)
        )
    )
    yield history
    time.sleep(0.25)

    history.append(
        ChatMessage(
            role="assistant",
            content="The result is confirmed to be 378."
        )
    )
    yield history

def like(evt: gr.LikeData):
    print("User liked the response")
    print(evt.index, evt.liked, evt.value)

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(type="messages", height=500, show_copy_button=True)
    button = gr.Button("Calculate 27 * 14")
    button.click(generate_response, chatbot, chatbot)
    chatbot.like(like)

if __name__ == "__main__":
    demo.launch()
