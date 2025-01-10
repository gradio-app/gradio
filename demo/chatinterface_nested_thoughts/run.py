import gradio as gr
from gradio import ChatMessage
import time

sleep_time = 0.1
long_sleep_time = 1

def generate_response(message, history):
    start_time = time.time()
    responses = [
        ChatMessage(
            content="In order to find the current weather in San Francisco, I will need to use my weather tool.",
        )
    ]
    yield responses
    time.sleep(sleep_time)

    main_thought = ChatMessage(
            content="",
            metadata={"title": "Using Weather Tool", "id": 1, "status": "pending"},
        )

    responses.append(main_thought)

    yield responses
    time.sleep(long_sleep_time)
    responses[-1].content = "Will check: weather.com and sunny.org"
    yield responses
    time.sleep(sleep_time)
    responses.append(
        ChatMessage(
            content="Received weather from weather.com.",
            metadata={"title": "Checking weather.com", "parent_id": 1, "id": 2, "duration": 0.05},
        )
    )
    yield responses

    sunny_start_time = time.time()
    time.sleep(sleep_time)
    sunny_thought = ChatMessage(
            content="API Error when connecting to sunny.org 💥",
            metadata={"title": "Checking sunny.org", "parent_id": 1, "id": 3, "status": "pending"},
        )

    responses.append(sunny_thought)
    yield responses

    time.sleep(sleep_time)
    responses.append(
        ChatMessage(
            content="Failed again",
            metadata={"title": "I will try again", "id": 4, "parent_id": 3, "duration": 0.1},

        )
    )
    sunny_thought.metadata["status"] = "done"
    sunny_thought.metadata["duration"] = time.time() - sunny_start_time

    main_thought.metadata["status"] = "done"
    main_thought.metadata["duration"] = time.time() - start_time

    yield responses

    time.sleep(long_sleep_time)

    responses.append(
        ChatMessage(
            content="Based on the data only from weather.com, the current weather in San Francisco is 60 degrees and sunny.",
        )
    )
    yield responses

demo = gr.ChatInterface(
    generate_response,
    type="messages",
    title="Nested Thoughts Chat Interface",
    examples=["What is the weather in San Francisco right now?"]
)

if __name__ == "__main__":
    demo.launch()
