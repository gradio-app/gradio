import sys

import typer
from gradio_client.cli.deploy_discord import main as deploy_discord # type: ignore

from .commands import deploy, print_environment_info, reload, custom_component_app
from .commands.apps import app


app.command(name="", help="Launch a demo in reload mode")(reload)
app.command(name="environment", help="Print gradio environment info")(print_environment_info)
app.command(name="deploy-discord", help="Deploy Space as a Discord bot")(deploy_discord)
app.add_typer(custom_component_app)

def cli():
    app()
