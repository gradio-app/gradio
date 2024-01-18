from typer import Typer

from .build import _build
from .create import _create
from .dev import _dev
from .docs import _docs
from .install_component import _install
from .publish import _publish
from .show import _show

app = Typer(help="Create and publish a new Gradio component")

app.command("create", help="Create a new component.")(_create)
app.command(
    "build",
    help="Build the component for distribution. Must be called from the component directory.",
)(_build)
app.command("dev", help="Launch the custom component demo in development mode.")(_dev)
app.command("show", help="Show the list of available templates")(_show)
app.command("install", help="Install the custom component in the current environment")(
    _install
)
app.command("publish", help="Publish a component to PyPI and HuggingFace Hub")(_publish)
app.command("docs", help="Generate documentation for a custom components")(_docs)
