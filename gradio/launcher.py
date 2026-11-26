"""The Gradio launcher: a tab docked in the bottom-right corner of the page,
in place of the footer.

It shows the session's running and queued events, offers the call behind a
run as Python, JavaScript, cURL or an MCP tool call, and holds the footer's
links. The same script serves both kinds of app:

- a Blocks app, whose page loads it from its `<head>`
- a `gr.Server` app, whose HTML pages served from a `StaticFiles` mount at "/"
  get its `<script>` tag added, since the app brings its own frontend

The script lives in `launcher.js` and is served at `/gradio_api/launcher.js`,
after a line that tells it the app's links, root URL and kind.
"""

from __future__ import annotations

import json
import re
from functools import cache
from pathlib import Path
from typing import Any, Literal

SCRIPT_PATH = "/launcher.js"
"""Path of the launcher script, relative to the API prefix (/gradio_api)."""

LINKS = ("api", "gradio", "settings", "runs")

SERVER_LINKS = ("api", "gradio", "runs")
"""The links a `gr.Server` app can show: the settings panel only exists in
the Blocks page."""


@cache
def _script_source() -> str:
    return (Path(__file__).parent / "launcher.js").read_text(encoding="utf-8")


def launcher_links(
    footer_links: list[Any] | None,
    *,
    mode: Literal["blocks", "server"],
    run_history: bool,
) -> list[str]:
    """The items of `footer_links` that the launcher shows for this app."""
    supported = LINKS if mode == "blocks" else SERVER_LINKS
    return [
        link
        for link in footer_links or []
        if link in supported and (link != "runs" or run_history)
    ]


def launcher_script(links: list[str], root: str, mode: str) -> str:
    """The launcher's JavaScript, configured for an app at `root` (its public
    URL, without a trailing slash)."""
    options = json.dumps({"links": links, "root": root, "mode": mode})
    return f"window.__GRADIO_LAUNCHER__ = {options};\n{_script_source()}"


_HEAD_CLOSE = re.compile(rb"</head\s*>", re.IGNORECASE)
_BODY_OPEN = re.compile(rb"<body[\s>]", re.IGNORECASE)


def script_tag(src: str) -> bytes:
    return f'<script src="{src}"></script>'.encode()


def inject_launcher(html: bytes, src: str) -> bytes:
    """`html` with the launcher's `<script>` tag at the end of its `<head>`.

    It has to run before the page's own scripts, so that it sees the requests
    they make to the app. A page without a `<head>` gets the tag before its
    `<body>`, or at its start. A page that already loads the script is
    returned as is."""
    if src.encode() in html:
        return html
    tag = script_tag(src)
    for pattern in (_HEAD_CLOSE, _BODY_OPEN):
        match = pattern.search(html)
        if match:
            return html[: match.start()] + tag + html[match.start() :]
    return tag + html
