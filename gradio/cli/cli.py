import sys

import typer
from gradio_client.cli import deploy_discord  # type: ignore
from rich.console import Console

from .commands import (
    custom_component,
    deploy,
    hf_login,
    print_environment_info,
    reload,
    sketch,
    upload_mcp,
)

app = typer.Typer()
app.command("environment", help="Print Gradio environment information.")(
    print_environment_info
)
app.command(
    "deploy",
    help="Deploy a Gradio app to Spaces. Must be called within the directory you would like to deploy.",
)(deploy)
app.command("deploy-discord", help="Deploy a Gradio app to Discord.")(
    deploy_discord.main
)
app.command("sketch", help="Open the Sketch app to design a Gradio app.")(sketch)


def cli():
    args = sys.argv[1:]
    if len(args) == 0:
        raise ValueError("No file specified.")
    if args[0] in {"deploy", "environment", "deploy-discord", "sketch"}:
        app()
    elif args[0] in {"cc", "component"}:
        sys.argv = sys.argv[1:]
        custom_component()
    elif args[0] in {"build", "dev", "create", "show", "publish", "install"}:
        try:
            error = f"gradio {args[0]} is not a valid command. Did you mean `gradio cc {args[0]}` or `gradio component {args[0]}`?."
            raise ValueError(error)
        except ValueError:
            console = Console()
            console.print_exception()
    elif args[0] in {"upload-mcp"}:
        upload_mcp(args[1], args[2])
    elif args[0] == "--vibe":
        import os
        from pathlib import Path

        os.environ["GRADIO_VIBE_MODE"] = "1"

        demo_path = Path("demo.py") if len(args) == 1 else Path(args[1])

        if not demo_path.exists():
            template_content = """import gradio as gr

with gr.Blocks() as demo:
    pass

demo.launch()"""
            with open(demo_path, "w") as f:
                f.write(template_content)
            print(f"Created {demo_path} with default Gradio template.")

        print(
            "\n⚠️  WARNING: Vibe editor mode is enabled. Anyone who can access the Gradio endpoint can modify files and run arbitrary code on the host machine. Use with caution!\n"
        )

        hf_login()

        sys.argv = ["gradio", str(demo_path)]
        typer.run(reload)
    else:
        typer.run(reload)
