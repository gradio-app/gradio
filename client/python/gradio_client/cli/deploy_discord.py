from typing import List, Optional

from typer import Option
from typing_extensions import Annotated

from gradio_client import Client


def main(
    src: Annotated[
        Optional[str],
        Option(
            help="The space id or url or gradio app you want to deploy as a gradio bot."
        ),
    ] = None,
    discord_bot_token: Annotated[
        str, Option(help="Discord bot token. Get one on the discord website.")
    ] = None,
    api_names: Annotated[
        List[str], Option(help="Api names to turn into discord bots")
    ] = None,
    to_id: Annotated[
        Optional[str], Option(help="Name of the space used to host the discord bot")
    ] = None,
    hf_token: Annotated[
        Optional[str],
        Option(
            help=(
                "Hugging Face token. Can be ommitted if you are logged in via huggingface_hub cli. "
                "Must be provided if upstream space is private."
            )
        ),
    ] = None,
    private: Annotated[
        bool, Option(help="Whether the discord bot space is private.")
    ] = False,
):
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
