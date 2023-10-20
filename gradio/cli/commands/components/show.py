import inspect

from rich.console import Console
from rich.table import Table
from typer import Option
from typing_extensions import Annotated

import gradio._simple_templates
import gradio.components
import gradio.layouts
from gradio.blocks import BlockContext
from gradio.components import Component, FormComponent

_IGNORE = {
    "Text",
    "Dataframe",
    "Highlightedtext",
    "Annotatedimage",
    "Checkboxgroup",
    "Json",
    "Highlight",
    "Component",
    "Form",
    "Dataset",
    "FormComponent",
    "Fallback",
    "State",
}


def _get_table_items(module):
    items = []
    for name in module.__all__:
        gr_cls = getattr(module, name)
        if not (
            inspect.isclass(gr_cls) and issubclass(gr_cls, (Component, BlockContext))
        ) or (name in _IGNORE):
            continue
        tags = []
        if "Simple" in name:
            tags.append("[bold magenta]Beginner Friendly[/]")
        if issubclass(gr_cls, FormComponent):
            tags.append("[bold cyan]Form Component[/]")
        if name in gradio.layouts.__all__:
            tags.append("[bold light_coral]Layout[/]")
        doc = inspect.getdoc(gr_cls) or "No description available."
        doc = doc.split(".")[0]
        if tags:
            doc = f"[{', '.join(tags)}]" + " " + doc
        items.append((name, doc))

    return items


def _show(
    colors: Annotated[
        bool,
        Option(
            help="Show colors in the table. Defaults to true. If your terminal does not support colors, use --no-colors."
        ),
    ] = True
):
    items = (
        _get_table_items(gradio._simple_templates)
        + _get_table_items(gradio.components)
        + _get_table_items(gradio.layouts)
    )
    table = Table(show_header=True, header_style="orange1", show_lines=True)
    table.add_column("Name", justify="center")
    table.add_column("Description", justify="center")

    for item in items:
        table.add_row(*item)

    console = Console()
    with console.pager(styles=colors):
        console.print(table)
