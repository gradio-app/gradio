from __future__ import annotations

import typer

from .load_chat import main as chat

load_app = typer.Typer(help="Load various types of interfaces and models")

load_app.command("chat", help="Launch a chat interface using OpenAI-compatible API")(
    chat
)
