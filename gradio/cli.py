import sys

from gradio_client.cli import deploy_discord  # type: ignore

import gradio.cli_env_info
import gradio.deploy_space
import gradio.reload


def cli():
    args = sys.argv[1:]
    if len(args) == 0:
        raise ValueError("No file specified.")
    elif args[0] == "deploy":
        gradio.deploy_space.deploy()
    elif args[0] == "environment":
        gradio.cli_env_info.print_environment_info()
    elif args[0] == "deploy-discord":
        deploy_discord.main()
    else:
        gradio.reload.main()
