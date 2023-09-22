from typer import Typer

from .build import _build
from .create import _create
from .dev import _dev

app = Typer()

app.command("create", help="Create a new component.")(_create)
app.command(
    "build",
    help="Build the component for distribution. Must be called from the component directory.",
)(_build)
app.command("dev", help="Launch the custom component demo in development mode.")(_dev)
