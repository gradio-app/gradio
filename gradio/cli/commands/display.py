"""Plain-text output helpers shared by the Gradio command line."""

from __future__ import annotations

import time
from collections.abc import Iterable, Sequence
from types import TracebackType

import click


class LivePanelDisplay:
    """Prints the progress messages of a multi-step command as they happen."""

    def __init__(self, msg: str | None = None) -> None:
        self.lines: list[str] = []
        if msg:
            self.update(msg)

    def update(self, msg: str, add_sleep: float | None = None):
        self.lines.append(msg)
        print(msg, flush=True)
        if add_sleep:
            time.sleep(add_sleep)

    def __enter__(self) -> LivePanelDisplay:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        return None


def format_table(
    headers: Sequence[str], rows: Iterable[Sequence[str]], title: str | None = None
) -> str:
    """Lays out rows as a text table whose columns are as wide as their widest cell."""
    rows = [[str(cell) for cell in row] for row in rows]
    widths = [
        max(len(header), *(len(row[i]) for row in rows)) if rows else len(header)
        for i, header in enumerate(headers)
    ]

    def line(cells: Sequence[str]) -> str:
        return "  ".join(
            cell.ljust(width) for cell, width in zip(cells, widths)
        ).rstrip()

    lines = [title, ""] if title else []
    lines += [line(headers), line(["-" * width for width in widths])]
    lines += [line(row) for row in rows]
    return "\n".join(lines)


def print_box(text: str) -> None:
    """Prints a message set off by a rule above and below it."""
    rule = "-" * min(79, max(len(line) for line in text.splitlines()))
    print(f"{rule}\n{text}\n{rule}")


def confirm(question: str) -> bool:
    """Asks a yes/no question; an empty answer means no."""
    return click.confirm(question, default=False)


def ask(question: str, password: bool = False) -> str:
    """Asks for a line of text; an empty answer returns an empty string."""
    return click.prompt(
        question, default="", show_default=False, hide_input=password
    ).strip()
