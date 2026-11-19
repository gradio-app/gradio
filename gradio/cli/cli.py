import sys

import click

from .commands import (
    custom_component,
    deploy,
    deploy_command,
    load_app,
    print_environment_info,
    reload,
    skills_app,
    upload_mcp,
)
from .commands.extensions import extensions_app, list_extensions, run_extension

app = click.Group(
    name="gradio",
    commands=[
        click.Command(
            name="environment",
            callback=print_environment_info,
            help="Print Gradio environment information.",
        ),
        deploy_command,
        load_app,
        skills_app,
        extensions_app,
    ],
)

# `gradio info` and `gradio predict` are no longer built in. They are provided by
# an extension, so that Gradio itself does not need their dependencies.
_MOVED_TO_EXTENSION = {"info", "predict"}


def cli():
    args = sys.argv[1:]
    if len(args) == 0:
        raise ValueError("No file specified.")
    if args == ["--help"]:
        app(args=["--help"], prog_name="gradio", standalone_mode=False)
        click.echo("\nRun an app: gradio APP.py [OPTIONS]. See `gradio APP.py --help`.")
        list_extensions()
    elif args[0] in app.commands or args[0] == "deploy-discord":
        app(prog_name="gradio")
    elif args[0] in {"cc", "component"}:
        custom_component(args=args[1:], prog_name=f"gradio {args[0]}")
    elif args[0] in {"build", "dev", "create", "show", "publish", "install"}:
        raise SystemExit(
            f"gradio {args[0]} is not a valid command. Did you mean `gradio cc {args[0]}` or `gradio component {args[0]}`?"
        )
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
    elif run_extension(args[0], args[1:]):
        pass
    elif args[0] in _MOVED_TO_EXTENSION:
        raise SystemExit(
            f"`gradio {args[0]}` is no longer built into Gradio. Install the `hf-gradio` "
            f"package and run `hf-gradio {args[0]}` instead."
        )
    else:
        reload()


__all__ = ["cli", "deploy"]
