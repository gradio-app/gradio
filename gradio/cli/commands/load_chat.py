from __future__ import annotations

import os

import typer

from gradio.external import load_chat as load_chat_external


def main(
    base_url: str = typer.Argument(
        ..., help="OpenAI-compatible base URL, e.g. http://localhost:11434/v1/"
    ),
    model: str = typer.Argument(..., help="Model name, e.g. llama3.2"),
    token: str | None = typer.Option(
        None,
        "--token",
        "-t",
        help="API key (defaults to $OPENAI_API_KEY if not provided)",
    ),
    file_types: list[str] = typer.Option(
        ["text_encoded"],
        "--file-types",
        help="Repeatable option. Allowed values: text_encoded, image",
    ),
    system_message: str | None = typer.Option(
        None, "--system-message", help="Optional system prompt"
    ),
    stream: bool = typer.Option(
        True, "--stream/--no-stream", help="Enable or disable streaming"
    ),
    host: str | None = typer.Option(
        None, "--host", help="Server host (maps to launch.server_name)"
    ),
    port: int = typer.Option(
        7860, "--port", help="Server port (maps to launch.server_port)"
    ),
    share: bool = typer.Option(
        False, "--share/--no-share", help="Create a public share link"
    ),
) -> None:
    """Launch a chat interface using OpenAI-compatible API."""
    resolved_token = token or os.getenv("OPENAI_API_KEY")

    for ft in file_types:
        if ft not in {"text_encoded", "image"}:
            raise typer.BadParameter("file_types must be one of: text_encoded, image")

    demo = load_chat_external(
        base_url=base_url,
        model=model,
        token=resolved_token,
        file_types=file_types,
        system_message=system_message,
        streaming=stream,
    )

    demo.launch(server_name=host, server_port=port, share=share)
