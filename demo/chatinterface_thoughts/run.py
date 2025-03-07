import gradio as gr
from gradio import ChatMessage
import time

sleep_time = 0.5

def simulate_thinking_chat(message, history):
    start_time = time.time()
    response = ChatMessage(
        content="",
        metadata={"title": "_Thinking_ step-by-step", "id": 0, "status": "pending"}
    )
    yield response

    thoughts = [
        "<thinking>First, I need to understand the core aspects of the query...</thinking>",
        "<thinking>Now, considering the broader context and implications...</thinking>",
        "<thinking>Analyzing potential approaches to formulate a comprehensive answer...</thinking>",
        "<thinking>Finally, structuring the response for clarity and completeness...</thinking>"
    ]

    accumulated_thoughts = ""
    for thought in thoughts:
        time.sleep(sleep_time)
        accumulated_thoughts += f"- {thought}\n\n"
        response.content = accumulated_thoughts.strip()
        yield response

    response.metadata["status"] = "done"
    response.metadata["duration"] = time.time() - start_time
    yield response

    response = [
        response,
        ChatMessage(
            content="Based on my thoughts and analysis above, my response is: This dummy repro shows how thoughts of a thinking LLM can be progressively shown before providing its final answer."
        )
    ]
    yield response

chatbot = gr.Chatbot(allow_tags=True)
demo = gr.ChatInterface(
    simulate_thinking_chat,
    title="Thinking LLM Chat Interface 🤔",
    type="messages",
    chatbot=chatbot,
)

if __name__ == "__main__":
    demo.launch()
