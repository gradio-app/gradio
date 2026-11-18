from __future__ import annotations

import click

from .load_chat import chat_command

load_app = click.Group(
    name="load",
    help="Load various types of interfaces and models",
    commands=[chat_command],
)
