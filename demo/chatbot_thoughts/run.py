import gradio as gr
from gradio import ChatMessage
import time

def simulate_thinking_chat(message: str, history: list):
    history.append(
        ChatMessage(
            role="assistant",
            content="",
            metadata={"title": "Thinking... ", "log": "Starting analysis"}
        )
    )
    time.sleep(0.5)
    yield history

    thoughts = [
        "First, I need to understand the core aspects of the query...",
        "Now, considering the broader context and implications...",
        "Analyzing potential approaches to formulate a comprehensive answer...",
        "Finally, structuring the response for clarity and completeness..."
    ]

    accumulated_thoughts = ""

    for i, thought in enumerate(thoughts):
        time.sleep(0.5)

        accumulated_thoughts += f"- {thought}\n\n"

        history[-1] = ChatMessage(
            role="assistant",
            content=accumulated_thoughts.strip(),
            metadata={
                "title": "Thinking...",
                "log": f"Step {i+1} completed.",
                "duration": 0.5 * (i + 1)
            }
        )
        yield history

    history.append(
        ChatMessage(
            role="assistant",
            content="Based on my thoughts and analysis above, my response is: This dummy repro shows how thoughts of a thinking LLM can be progressively shown before providing its final answer."
        )
    )
    yield history

with gr.Blocks() as demo:
    gr.Markdown("# Thinking LLM Demo 🤔")
    chatbot = gr.Chatbot(type="messages", render_markdown=True)
    msg = gr.Textbox(placeholder="Type your message...")

    msg.submit(
        lambda m, h: (m, h + [ChatMessage(role="user", content=m)]),
        [msg, chatbot],
        [msg, chatbot]
    ).then(
        simulate_thinking_chat,
        [msg, chatbot],
        chatbot
    )

if __name__ == "__main__":
    demo.launch()
