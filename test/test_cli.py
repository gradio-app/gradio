import sys

import click
import pytest
from click.testing import CliRunner

from gradio.cli.commands.display import format_table

cli_module = sys.modules["gradio.cli.cli"]


def _walk(command: click.Command, path: tuple[str, ...] = ()):
    yield path, command
    if isinstance(command, click.Group):
        for name, sub in command.commands.items():
            yield from _walk(sub, (*path, name))


def _all_commands():
    from gradio.cli.commands import custom_component
    from gradio.cli.commands.reload import build_app

    yield from _walk(cli_module.app)
    yield from _walk(custom_component, ("cc",))
    yield ("APP.py",), build_app()


@pytest.mark.parametrize(
    "command",
    [c for _, c in _all_commands()],
    ids=[" ".join(p) or "gradio" for p, _ in _all_commands()],
)
def test_every_command_shows_help(command):
    result = CliRunner().invoke(command, ["--help"])
    assert result.exit_code == 0, result.output
    assert "Usage:" in result.output


def test_command_parameters_match_the_functions_they_call():
    """Each command's options are declared separately from the function it calls, so
    check that they cannot drift apart."""
    import inspect

    for path, command in _all_commands():
        if isinstance(command, click.Group) or command.callback is None:
            continue
        expected = set(inspect.signature(command.callback).parameters)
        declared = {param.name for param in command.params}
        assert declared == expected, " ".join(path)


def test_boolean_options_can_be_negated():
    from gradio.cli.commands.components.build import _build, build_command

    seen = {}
    command = click.Command(
        "build", callback=lambda **kw: seen.update(kw), params=build_command.params
    )
    assert build_command.callback is _build
    CliRunner().invoke(command, ["some/dir", "--no-build-frontend", "--bump-version"])
    assert str(seen["path"]) == "some/dir"
    assert seen["build_frontend"] is False
    assert seen["bump_version"] is True
    assert seen["generate_docs"] is True


@pytest.mark.parametrize("name", ["info", "predict"])
def test_removed_commands_point_to_hf_gradio(name, monkeypatch):
    monkeypatch.setattr(sys, "argv", ["gradio", name, "gradio/calculator"])
    with pytest.raises(SystemExit, match=f"hf-gradio {name}"):
        cli_module.cli()


def test_removed_command_names_can_be_provided_by_an_extension():
    from gradio.cli.commands.extensions import RESERVED_COMMANDS

    assert not {"info", "predict"} & RESERVED_COMMANDS


def test_format_table_aligns_columns():
    table = format_table(("Name", "Status"), [("a", "ok"), ("longer", "bad")])
    assert table.splitlines() == [
        "Name    Status",
        "------  ------",
        "a       ok",
        "longer  bad",
    ]
