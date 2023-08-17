import os
import subprocess
import sys

from gradio_client.cli import deploy_discord  # type: ignore

import gradio.cli_env_info
import gradio.deploy_space
import gradio.reload

dir_path = os.path.dirname(os.path.realpath(__file__))
dev_template_path = os.path.join(dir_path, "templates", "dev")
node_path = "/usr/local/bin/node"
dev_server_node_path = os.path.join(dir_path, "node", "dev","files", "index.js")

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
    elif args[0] == "custom-dev":
        subprocess.Popen(['node', dev_server_node_path, dev_template_path], stdout=sys.stdout, stderr=sys.stderr).communicate()
        
    else:
        gradio.reload.main()
