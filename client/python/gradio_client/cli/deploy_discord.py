from __future__ import annotations

from gradio_client import Client
from typer import Option, Argument, run
from typing import Annotated, Optional, List, Tuple


def main(src: Annotated[str, Argument(help="The space id or url or gradio app you want to deploy as a gradio bot.")], 
        discord_bot_token: Annotated[Optional[str], Option(help="Discord bot token. Get one on the discord website.")] = None,
        to_id: Annotated[Optional[str], Option(help="Name of the space used to host the discord bot")] = None,
        hf_token: Annotated[Optional[str], Option(help="Hugging Face token. Can be ommitted if you are logged in via huggingface_hub cli. "
                                                         "Must be provided if upstream space is private.")] = None,
        private: Annotated[bool, Option(help="Whether the discord bot space is private.")] = False,
        api_names: Annotated[Optional[List[str]],
                             Option(help="Api name to turn into discord bot commands. Separate by a comma like so: <gradio-api-name>,<discord-command-name>")] = None):
    for i, name in enumerate(api_names):
        if "," in name:
            api_names[i] = tuple(name.split(","))

    Client(src).deploy_discord(
        discord_bot_token=discord_bot_token,
        api_names=api_names,
        to_id=to_id,
        hf_token=hf_token,
        private=private,
    )