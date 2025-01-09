import gradio as gr
from gradio import ChatMessage
import time

sleep_time = 0.5

def simulate_thinking_chat(message, history):
    response = ChatMessage(
        content="",
        metadata={"title": "_Thinking_ step-by-step", "id": 0, "status": "pending"}
    )
    yield response

    thoughts = [
        "First, I need to understand the core aspects of the query...",
        "Now, considering the broader context and implications...",
        "Analyzing potential approaches to formulate a comprehensive answer...",
        "Finally, structuring the response for clarity and completeness..."
    ]

    accumulated_thoughts = ""
    for thought in thoughts:
        time.sleep(sleep_time)
        accumulated_thoughts += f"- {thought}\n\n"
        response.content = accumulated_thoughts.strip()
        yield response

    response.metadata["status"] = "done"
    yield response

    response = [
        response,
        ChatMessage(
            content="Based on my thoughts and analysis above, my response is: This dummy repro shows how thoughts of a thinking LLM can be progressively shown before providing its final answer."
        )
    ]
    yield response


demo = gr.ChatInterface(
    simulate_thinking_chat,
    title="Thinking LLM Chat Interface 🤔",
    type="messages",
)

if __name__ == "__main__":
    demo.launch()
