from __future__ import annotations

import inspect

import click

import gradio._simple_templates
import gradio.components
import gradio.layouts
from gradio.analytics import custom_component_analytics
from gradio.blocks import BlockContext
from gradio.cli.commands.display import format_table
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
    "LogoutButton",
}

_BEGINNER_FRIENDLY = {"Slider", "Radio", "Checkbox", "Number", "CheckboxGroup", "File"}


def _get_table_items(module):
    items = []
    for name in module.__all__:
        if name in _IGNORE:
            continue
        gr_cls = getattr(module, name)
        if not (
            inspect.isclass(gr_cls) and issubclass(gr_cls, (Component, BlockContext))
        ):
            continue
        tags = []
        if "Simple" in name or name in _BEGINNER_FRIENDLY:
            tags.append("Beginner Friendly")
        if issubclass(gr_cls, FormComponent):
            tags.append("Form Component")
        if name in gradio.layouts.__all__:
            tags.append("Layout")
        doc = inspect.getdoc(gr_cls) or "No description available."
        doc = doc.split(".")[0]
        if tags:
            doc = f"[{', '.join(tags)}]" + " " + doc
        items.append((name, doc))

    return items


def _show():
    custom_component_analytics(
        "show",
        None,
        upload_demo=None,
        upload_pypi=None,
        upload_source=None,
    )
    items = (
        _get_table_items(gradio._simple_templates)
        + _get_table_items(gradio.components)
        + _get_table_items(gradio.layouts)
    )
    click.echo_via_pager(format_table(("Name", "Description"), items) + "\n")


show_command = click.Command(
    name="show", callback=_show, help="Show the list of available templates"
)
