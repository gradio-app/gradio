"""Regression guards for Gradio's offline support.

Gradio is meant to work without any network access once installed: the built-in
themes, the app/SPA HTML shells, and the MCP landing page must reference their
fonts and scripts from the bundled ``/static`` assets rather than an external
CDN. These tests encode that contract so a future change that reintroduces a
runtime CDN dependency (e.g. a built-in theme switching to a non-bundled font,
or an entrypoint adding ``<script src="https://...">``) fails loudly.

Note: CDN *fallbacks* (``GoogleFont`` for user-supplied fonts, the Bokeh plugin
fallback) are intentional and are NOT what these tests forbid -- the contract is
that the default, built-in experience resolves locally.
"""

from __future__ import annotations

import inspect
import re
from pathlib import Path

import pytest

import gradio as gr
from gradio.mcp import _MCP_LANDING_PAGE_TEMPLATE
from gradio.themes.base import Base

REPO_ROOT = Path(__file__).resolve().parents[1]

# Hosts that the offline work removed from the default asset paths. A relative
# URL never contains "://", so this set is only consulted for absolute URLs.
EXTERNAL_URL = re.compile(r"^(https?:)?//", re.IGNORECASE)

# <script src="..."> and <link rel="stylesheet|preload|..." href="...">
SCRIPT_SRC = re.compile(r"<script\b[^>]*\bsrc\s*=\s*['\"]([^'\"]*)['\"]", re.IGNORECASE)
LINK_TAG = re.compile(r"<link\b[^>]*>", re.IGNORECASE)
LINK_HREF = re.compile(r"\bhref\s*=\s*['\"]([^'\"]*)['\"]", re.IGNORECASE)
LINK_REL = re.compile(r"\brel\s*=\s*['\"]([^'\"]*)['\"]", re.IGNORECASE)
CSS_URL = re.compile(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", re.IGNORECASE)

# <link> rels that actually load an asset (vs. metadata like canonical/alternate).
ASSET_LINK_RELS = {"stylesheet", "preload", "modulepreload", "icon", "manifest"}


def _builtin_themes() -> list[type[Base]]:
    themes = [
        obj
        for _, obj in inspect.getmembers(gr.themes, inspect.isclass)
        if issubclass(obj, Base) and obj is not Base
    ]
    assert themes, "expected to discover built-in themes"
    return themes


def _asset_urls_in_html(html: str) -> list[str]:
    """Return URLs that the browser would fetch as assets from this HTML."""
    urls = list(SCRIPT_SRC.findall(html))
    for tag in LINK_TAG.findall(html):
        rel_match = LINK_REL.search(tag)
        rels = set(rel_match.group(1).lower().split()) if rel_match else set()
        if rels & ASSET_LINK_RELS:
            href = LINK_HREF.search(tag)
            if href:
                urls.append(href.group(1))
    return urls


@pytest.mark.parametrize("theme_cls", _builtin_themes(), ids=lambda c: c.__name__)
def test_builtin_themes_use_no_external_stylesheets(theme_cls: type[Base]):
    """Built-in themes must bundle their fonts locally, not pull from a CDN.

    ``_stylesheets`` is populated with an external URL only when a font is not
    available as a bundled local asset (see ``GoogleFont.stylesheet``), so a
    non-empty list means the theme would hit the network to render.
    """
    theme = theme_cls()
    assert theme._stylesheets == [], (
        f"{theme_cls.__name__} loads external stylesheet(s) {theme._stylesheets}; "
        "bundle the font under templates/frontend/static/fonts and reference it "
        "with LocalFont so the theme works offline."
    )


@pytest.mark.parametrize("theme_cls", _builtin_themes(), ids=lambda c: c.__name__)
def test_builtin_theme_font_css_is_local(theme_cls: type[Base]):
    """Every @font-face url() in a built-in theme must be a relative static path."""
    theme = theme_cls()
    for css in theme._font_css:
        for url in CSS_URL.findall(css):
            assert not EXTERNAL_URL.match(url), (
                f"{theme_cls.__name__} font CSS references external url {url!r}"
            )
            assert url.startswith("static/fonts/"), (
                f"{theme_cls.__name__} font CSS references {url!r}, expected a "
                "bundled 'static/fonts/...' path"
            )


@pytest.mark.parametrize(
    "html_path",
    ["js/app/src/app.html", "js/spa/index.html"],
)
def test_html_entrypoints_load_no_external_assets(html_path: str):
    """The app/SPA HTML shells must load scripts and stylesheets locally."""
    path = REPO_ROOT / html_path
    if not path.exists():
        pytest.skip(f"{html_path} not present (installed package, not a checkout)")
    html = path.read_text(encoding="utf-8")
    external = [url for url in _asset_urls_in_html(html) if EXTERNAL_URL.match(url)]
    assert not external, (
        f"{html_path} loads external asset(s) {external}; serve them from the "
        "bundled /static directory so Gradio works offline."
    )


def test_mcp_landing_page_loads_no_external_assets():
    """The MCP landing page must reference fonts/scripts from /static, not a CDN."""
    template = _MCP_LANDING_PAGE_TEMPLATE
    external_assets = [
        url for url in _asset_urls_in_html(template) if EXTERNAL_URL.match(url)
    ]
    assert not external_assets, (
        f"MCP landing page loads external asset(s) {external_assets}"
    )
    external_css = [url for url in CSS_URL.findall(template) if EXTERNAL_URL.match(url)]
    assert not external_css, (
        f"MCP landing page CSS references external url(s) {external_css}"
    )
