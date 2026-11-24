"""A minimal Gradio footer for `gr.Server` apps.

A `gr.Server` app brings its own frontend, so the footer that `Blocks.svelte`
renders never appears. This module provides a small, dependency-free
`<gradio-footer>` web component, served at `/gradio_api/footer.js`, and the
helper that adds its `<script>` tag to the HTML pages a `gr.Server` serves
from a `StaticFiles` mount at "/".

Only the links that work without the Blocks frontend are shown: "Built with
Gradio" and the run history page. The API docs and settings panels live
inside `Blocks`, so "api" and "settings" are skipped here.
"""

from __future__ import annotations

import json
import re
from typing import Any

FOOTER_SCRIPT_PATH = "/footer.js"
"""Path of the footer script, relative to the API prefix (/gradio_api)."""

SERVER_FOOTER_LINKS = ("gradio", "runs")
"""The `footer_links` the server footer can show."""

_LOGO_SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 576" fill="none" '
    'aria-hidden="true"><defs><linearGradient id="g" x1="60" y1="0" x2="514" '
    'y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#F9D100"/>'
    '<stop offset="1" stop-color="#F97700"/></linearGradient></defs>'
    '<g stroke="url(#g)" stroke-width="59" stroke-linejoin="round">'
    '<path d="M287.5 229L86 344.5L287.5 460L489 344.5L287.5 229Z"/>'
    '<path d="M287.5 116L86 231.5L287.5 347L489 231.5L287.5 116Z"/>'
    '<path d="M86 344L288 229" stroke-linejoin="bevel"/></g></svg>'
)

_FOOTER_JS = """\
const config = __CONFIG__;
const LOGO = __LOGO__;

class GradioFooter extends HTMLElement {
	connectedCallback() {
		if (this.shadowRoot) return;
		const root = this.attachShadow({ mode: "open" });
		const style = document.createElement("style");
		style.textContent = `
			:host { display: block; }
			footer {
				display: flex;
				justify-content: center;
				align-items: center;
				gap: 0.5rem;
				margin: 1rem 0;
				font-family: system-ui, -apple-system, sans-serif;
				font-size: 0.875rem;
				color: var(--gradio-footer-color, #6b7280);
			}
			a {
				display: inline-flex;
				align-items: center;
				gap: 0.25rem;
				color: inherit;
				text-decoration: none;
			}
			a:hover { color: var(--gradio-footer-hover-color, #111827); }
			svg { width: 1rem; height: 1rem; }
			@media (prefers-color-scheme: dark) {
				footer { color: var(--gradio-footer-color, #9ca3af); }
				a:hover { color: var(--gradio-footer-hover-color, #f3f4f6); }
			}
		`;
		const footer = document.createElement("footer");
		footer.setAttribute("aria-label", "Gradio footer navigation");
		config.links.forEach((link, i) => {
			if (i > 0) {
				const divider = document.createElement("span");
				divider.textContent = "\\u00b7";
				footer.append(divider);
			}
			const a = document.createElement("a");
			a.href = link.href;
			a.textContent = link.label;
			if (link.external) {
				a.target = "_blank";
				a.rel = "noreferrer";
			}
			if (link.logo) a.insertAdjacentHTML("beforeend", LOGO);
			footer.append(a);
		});
		root.append(style, footer);
	}
}

if (!customElements.get("gradio-footer")) {
	customElements.define("gradio-footer", GradioFooter);
}

// Add the footer at the end of the page, unless the page placed one itself.
function mount() {
	if (config.links.length && !document.querySelector("gradio-footer")) {
		document.body.append(document.createElement("gradio-footer"));
	}
}
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", mount);
} else {
	mount();
}
"""


def footer_links_for_server(footer_links: list[Any], run_history: bool) -> list[str]:
    """The links of `footer_links` that the server footer can show."""
    return [
        link
        for link in footer_links
        if link in SERVER_FOOTER_LINKS and (link != "runs" or run_history)
    ]


def footer_script(links: list[str], root: str, api_prefix: str) -> str:
    """The JavaScript of the `<gradio-footer>` web component, for `links`.

    `root` is the public URL of the app, without a trailing slash.
    """
    entries: list[dict[str, Any]] = []
    for link in links:
        if link == "runs":
            entries.append({"label": "Runs", "href": f"{root}{api_prefix}/runs"})
        elif link == "gradio":
            entries.append(
                {
                    "label": "Built with Gradio",
                    "href": "https://gradio.app",
                    "external": True,
                    "logo": True,
                }
            )
    return _FOOTER_JS.replace("__CONFIG__", json.dumps({"links": entries})).replace(
        "__LOGO__", json.dumps(_LOGO_SVG)
    )


_BODY_CLOSE = re.compile(rb"</body\s*>", re.IGNORECASE)


def script_tag(src: str) -> bytes:
    return f'<script type="module" src="{src}"></script>'.encode()


def inject_footer(html: bytes, src: str) -> bytes:
    """`html` with the footer's `<script>` tag before its last `</body>`, or
    at its end when it has none. A page that already loads the script is
    returned as is."""
    if src.encode() in html:
        return html
    tag = script_tag(src)
    matches = list(_BODY_CLOSE.finditer(html))
    if not matches:
        return html + tag
    index = matches[-1].start()
    return html[:index] + tag + html[index:]
