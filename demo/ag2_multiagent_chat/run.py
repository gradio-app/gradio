"""AG2 Multi-Agent GroupChat with Gradio UI.

Demonstrates real-time multi-agent collaboration using AG2's GroupChat
streamed to a Gradio ChatInterface. Three specialized agents — Researcher,
Writer, and Critic — collaborate to produce content based on user prompts.

Requires: pip install "ag2[openai]>=0.11.4,<1.0" gradio
"""

import os
import queue
import threading

import gradio as gr
from gradio import ChatMessage

from autogen import (
    AssistantAgent,
    GroupChat,
    GroupChatManager,
    LLMConfig,
    UserProxyAgent,
)

# --- LLM Configuration ---

llm_config = LLMConfig(
    {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        "api_key": os.environ.get("OPENAI_API_KEY", ""),
        "api_type": "openai",
    }
)

# --- Agent Definitions ---

researcher = AssistantAgent(
    name="Researcher",
    system_message=(
        "You are a research specialist. When given a topic, provide 3-5 key "
        "facts and insights. Be concise and structured. Use bullet points."
    ),
    llm_config=llm_config,
)

writer = AssistantAgent(
    name="Writer",
    system_message=(
        "You are a skilled writer. Take the research and create a clear, "
        "engaging summary in 2-3 paragraphs. Keep it under 200 words."
    ),
    llm_config=llm_config,
)

critic = AssistantAgent(
    name="Critic",
    system_message=(
        "You are a quality reviewer. Evaluate the content for accuracy and "
        "clarity. If it meets standards, say 'APPROVED' and reply TERMINATE. "
        "Otherwise give specific feedback for improvement."
    ),
    llm_config=llm_config,
)

AGENT_EMOJI = {
    "Researcher": "🔍",
    "Writer": "✍️",
    "Critic": "🧐",
}


def run_groupchat(user_message: str, msg_queue: queue.Queue):
    """Run AG2 GroupChat in a background thread, pushing messages to queue."""
    user_proxy = UserProxyAgent(
        name="User",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=0,
        code_execution_config=False,
    )

    group_chat = GroupChat(
        agents=[user_proxy, researcher, writer, critic],
        messages=[],
        max_round=8,
        speaker_selection_method="auto",
    )

    manager = GroupChatManager(
        groupchat=group_chat,
        llm_config=llm_config,
    )

    try:
        user_proxy.run(manager, message=user_message).process()
    except Exception as e:
        msg_queue.put({"name": "System", "content": f"Error: {e}"})
    finally:
        for msg in group_chat.messages:
            if msg.get("name") != "User":
                msg_queue.put(msg)
        msg_queue.put(None)  # Sentinel: conversation complete


# --- Gradio Interface ---


def respond(user_message, history):
    """Stream AG2 GroupChat messages to Gradio chat."""
    if not os.environ.get("OPENAI_API_KEY"):
        history.append(
            ChatMessage(
                role="assistant",
                content=(
                    "Please set the `OPENAI_API_KEY` environment variable "
                    "to use this demo."
                ),
            )
        )
        yield history
        return

    history.append(ChatMessage(role="user", content=user_message))
    yield history

    msg_queue: queue.Queue = queue.Queue()
    thread = threading.Thread(
        target=run_groupchat, args=(user_message, msg_queue), daemon=True
    )
    thread.start()

    seen: set = set()
    while True:
        thread.join(timeout=0.5)

        while not msg_queue.empty():
            msg = msg_queue.get_nowait()
            if msg is None:
                yield history
                return

            content = msg.get("content", "")
            name = msg.get("name", "Agent")
            msg_id = f"{name}:{content[:50]}"

            if msg_id not in seen and content.strip():
                seen.add(msg_id)
                emoji = AGENT_EMOJI.get(name, "🤖")
                history.append(
                    ChatMessage(
                        role="assistant",
                        content=content,
                        metadata={"title": f"{emoji} {name}"},
                    )
                )
                yield history

        if not thread.is_alive() and msg_queue.empty():
            break

    yield history


with gr.Blocks(title="AG2 Multi-Agent Chat") as demo:
    gr.Markdown(
        "# 🤖 AG2 Multi-Agent GroupChat\n"
        "Watch specialized AI agents collaborate in real time. "
        "A **Researcher**, **Writer**, and **Critic** work together "
        "to answer your questions.\n\n"
        "*Powered by [AG2](https://ag2.ai) — open-source multi-agent framework.*"
    )

    chatbot = gr.Chatbot(
        height=500,
        buttons=["copy"],
        avatar_images=(None, None),
    )

    msg = gr.Textbox(
        placeholder=(
            "Ask the agent team anything... (e.g., 'Explain quantum computing')"
        ),
        label="Your message",
        scale=4,
    )

    with gr.Row():
        submit = gr.Button("Send", variant="primary")
        clear = gr.ClearButton([msg, chatbot], value="Clear")

    submit.click(respond, [msg, chatbot], chatbot)
    msg.submit(respond, [msg, chatbot], chatbot)

if __name__ == "__main__":
    demo.launch()
