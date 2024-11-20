# type: ignore
from __future__ import annotations

from gradio import ChatMessage
from transformers.agents import ReactCodeAgent, agent_types
from typing import Generator

def pull_message(step_log: dict):
    if step_log.get("rationale"):
        yield ChatMessage(
            role="assistant", content=step_log["rationale"]
        )
    if step_log.get("tool_call"):
        used_code = step_log["tool_call"]["tool_name"] == "code interpreter"
        content = step_log["tool_call"]["tool_arguments"]
        if used_code:
            content = f"```py\n{content}\n```"
        yield ChatMessage(
            role="assistant",
            metadata={"title": f"🛠️ Used tool {step_log['tool_call']['tool_name']}"},
            content=content,
        )
    if step_log.get("observation"):
        yield ChatMessage(
            role="assistant", content=f"```\n{step_log['observation']}\n```"
        )
    if step_log.get("error"):
        yield ChatMessage(
            role="assistant",
            content=str(step_log["error"]),
            metadata={"title": "💥 Error"},
        )

def stream_from_transformers_agent(
    agent: ReactCodeAgent, prompt: str
) -> Generator[ChatMessage, None, ChatMessage | None]:
    """Runs an agent with the given prompt and streams the messages from the agent as ChatMessages."""

    class Output:
        output: agent_types.AgentType | str = None

    step_log = None
    for step_log in agent.run(prompt, stream=True):
        if isinstance(step_log, dict):
            for message in pull_message(step_log):
                print("message", message)
                yield message

    Output.output = step_log
    if isinstance(Output.output, agent_types.AgentText):
        yield ChatMessage(
            role="assistant", content=f"**Final answer:**\n```\n{Output.output.to_string()}\n```")  # type: ignore
    elif isinstance(Output.output, agent_types.AgentImage):
        yield ChatMessage(
            role="assistant",
            content={"path": Output.output.to_string(), "mime_type": "image/png"},  # type: ignore
        )
    elif isinstance(Output.output, agent_types.AgentAudio):
        yield ChatMessage(
            role="assistant",
            content={"path": Output.output.to_string(), "mime_type": "audio/wav"},  # type: ignore
        )
    else:
        return ChatMessage(role="assistant", content=Output.output)
