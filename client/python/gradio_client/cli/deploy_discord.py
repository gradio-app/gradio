import argparse

from gradio_client import Client


def main():
    parser = argparse.ArgumentParser(description="Deploy Space as Discord Bot.")
    parser.add_argument("deploy-discord")
    parser.add_argument(
        "--src",
        type=str,
        help="The space id or url or gradio app you want to deploy as a gradio bot.",
    )
    parser.add_argument(
        "--discord-bot-token",
        type=str,
        help="Discord bot token. Get one on the discord website.",
    )
    parser.add_argument(
        "--api-names",
        nargs="?",
        help="Api names to turn into discord bots",
        default=None,
    )
    parser.add_argument(
        "--command-names",
        nargs="?",
        help="Bot command names for api names. Bot will be triggered by !<command-name>",
        default=None,
    )
    parser.add_argument(
        "--to-id",
        type=str,
        help="Name of the space used to host the discord bot",
        default=None,
    )
    parser.add_argument(
        "--hf-token",
        type=str,
        help=(
            "HuggingFace token. Can be ommitted if you are logged in via huggingface_hub cli. "
            "Must be provided if upstream space is private."
        ),
        default=None,
    )
    parser.add_argument(
        "--private",
        type=bool,
        help="Whether the discord bot space is private.",
        default=False,
    )
    parser.add_argument(
        "--persist-state", type=bool, help="Whether to persist state", default=True
    )
    args = parser.parse_args()
    Client(args.src).deploy_discord(
        discord_bot_token=args.discord_bot_token,
        api_names=args.api_names,
        command_names=args.command_names,
        to_id=args.to_id,
        hf_token=args.hf_token,
        private=args.private,
        persist_state=args.persist_state,
    )
