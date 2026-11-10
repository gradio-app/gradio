import sys

import typer
from rich.console import Console

from .commands import (
    custom_component,
    deploy,
    info,
    load_app,
    predict,
    print_environment_info,
    reload,
    skills_app,
    upload_mcp,
)
from .commands.extensions import extensions_app, list_extensions, run_extension

app = typer.Typer()
app.add_typer(load_app, name="load")
app.add_typer(skills_app, name="skills")
app.add_typer(extensions_app, name="extensions")
app.command("environment", help="Print Gradio environment information.")(
    print_environment_info
)
app.command(
    "deploy",
    help="Deploy a Gradio app to Spaces or Google Cloud Run. Must be called within the directory you would like to deploy.",
)(deploy)
app.command(
    "info",
    help="Fetches the expected JSON payload for all of a Gradio app's endpoints.",
)(info)
app.command(
    "predict",
    help="Sends a prediction request to a Gradio app endpoint.",
)(predict)


def cli():
    args = sys.argv[1:]
    if len(args) == 0:
        raise ValueError("No file specified.")
    if args == ["--help"]:
        app(args=["--help"], prog_name="gradio", standalone_mode=False)
        typer.echo("\nRun an app: gradio APP.py [OPTIONS]. See `gradio APP.py --help`.")
        list_extensions()
    elif args[0] in {
        "deploy",
        "environment",
        "deploy-discord",
        "load",
        "skills",
        "info",
        "predict",
        "extensions",
    }:
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
    elif args[0] == "sketch":
        raise ValueError(
            "`gradio sketch` has been removed. Build your app in Python and run it with `gradio app.py`."
        )
    elif args[0] in {"upload-mcp"}:
        upload_mcp(args[1], args[2])
    elif args[0] == "--vibe":
        raise ValueError(
            "`gradio --vibe` has been removed, along with the vibe editor. Run your app with `gradio app.py`."
        )
    elif not run_extension(args[0], args[1:]):
        reload()
