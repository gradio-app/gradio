from __future__ import annotations

import typer

from .load_chat import main as chat

load_app = typer.Typer(
    help="Load various types of interfaces and models"
)

# Register subcommands
load_app.command("chat", help="Launch a chat interface using OpenAI-compatible API")(chat)

def main():
    """Main entry point for the load command."""
    load_app()
