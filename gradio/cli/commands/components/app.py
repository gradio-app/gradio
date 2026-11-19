import click

from .build import build_command
from .create import create_command
from .dev import dev_command
from .docs import docs_command
from .install_component import install_command
from .publish import publish_command
from .show import show_command

app = click.Group(
    name="cc",
    help="Create and publish a new Gradio component",
    commands=[
        create_command,
        build_command,
        dev_command,
        show_command,
        install_command,
        publish_command,
        docs_command,
    ],
)
