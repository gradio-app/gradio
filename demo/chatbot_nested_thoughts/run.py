import gradio as gr
from gradio import ChatMessage
import time

sleep_time = 0.1
long_sleep_time = 1

def generate_response(history):
    history.append(
        ChatMessage(
            role="user", content="What is the weather in San Francisco right now?"
        )
    )
    yield history
    time.sleep(sleep_time)
    history.append(
        ChatMessage(
            role="assistant",
            content="In order to find the current weather in San Francisco, I will need to use my weather tool.",
        )
    )
    yield history
    time.sleep(sleep_time)
    history.append(
        ChatMessage(
            role="assistant",
            content="",
            metadata={"title": "Gathering Weather Websites", "id": 1},
        )
    )
    yield history
    time.sleep(long_sleep_time)
    history[-1].content = "Will check: weather.com and sunny.org"
    yield history
    time.sleep(sleep_time)
    history.append(
        ChatMessage(
            role="assistant",
            content="Received weather from weather.com.",
            metadata={"title": "API Success ✅", "parent_id": 1, "id": 2},
        )
    )
    yield history
    time.sleep(sleep_time)
    history.append(
        ChatMessage(
            role="assistant",
            content="API Error when connecting to sunny.org.",
            metadata={"title": "API Error 💥 ", "parent_id": 1, "id": 3},
        )
    )
    yield history
    time.sleep(sleep_time)

    history.append(
        ChatMessage(
            role="assistant",
            content="I will try yet again",
            metadata={"title": "I will try again", "id": 4, "parent_id": 3},
        )
    )
    yield history

    time.sleep(sleep_time)
    history.append(
        ChatMessage(
            role="assistant",
            content="Failed again",
            metadata={"title": "Failed again", "id": 6, "parent_id": 4},
        )
    )
    yield history

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(type="messages", height=500, show_copy_button=True)
    demo.load(generate_response, chatbot, chatbot)

if __name__ == "__main__":
    demo.launch()
