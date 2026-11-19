from __future__ import annotations

import os

import click


def main(
    base_url: str,
    model: str,
    token: str | None = None,
    file_types: list[str] | tuple[str, ...] = ("text_encoded",),
    system_message: str | None = None,
    stream: bool = True,
    host: str | None = None,
    port: int = 7860,
    share: bool = False,
) -> None:
    """Launch a chat interface using OpenAI-compatible API."""
    resolved_token = token or os.getenv("OPENAI_API_KEY")

    for ft in file_types:
        if ft not in {"text_encoded", "image"}:
            raise click.BadParameter("file_types must be one of: text_encoded, image")

    from gradio_components.external import load_chat as load_chat_external

    demo = load_chat_external(
        base_url=base_url,
        model=model,
        token=resolved_token,
        file_types=list(file_types),  # type: ignore
        system_message=system_message,
        streaming=stream,
    )

    demo.launch(server_name=host, server_port=port, share=share)


chat_command = click.Command(
    name="chat",
    callback=main,
    help="Launch a chat interface using OpenAI-compatible API",
    params=[
        click.Argument(["base_url"]),
        click.Argument(["model"]),
        click.Option(
            ["--token", "-t"],
            help="API key (defaults to $OPENAI_API_KEY if not provided)",
        ),
        click.Option(
            ["--file-types"],
            multiple=True,
            default=["text_encoded"],
            show_default=True,
            help="Repeatable option. Allowed values: text_encoded, image",
        ),
        click.Option(["--system-message"], help="Optional system prompt"),
        click.Option(
            ["--stream/--no-stream"],
            default=True,
            show_default=True,
            help="Enable or disable streaming",
        ),
        click.Option(["--host"], help="Server host (maps to launch.server_name)"),
        click.Option(
            ["--port"],
            type=int,
            default=7860,
            show_default=True,
            help="Server port (maps to launch.server_port)",
        ),
        click.Option(
            ["--share/--no-share"],
            default=False,
            show_default=True,
            help="Create a public share link",
        ),
    ],
)
