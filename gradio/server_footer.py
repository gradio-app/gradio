"""The footer script that a `gr.Server` app's own frontend can include.

A `gr.Server` app serves its own page, so the footer that `Blocks` renders is
not there. The page can add it with one tag:

    <script src="gradio_api/footer.js" defer></script>

The script defines a `<gradio-footer>` element and appends one to the end of
the page, unless the page already has one where it wants the footer.
"""

from __future__ import annotations

import json
from typing import Any

from gradio import _components_package

GRADIO_LOGO = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 576" fill="none" aria-hidden="true"><path d="M287.5 229L86 344.5L287.5 460L489 344.5L287.5 229Z" stroke="url(#a)" stroke-width="59" stroke-linejoin="round"/><path d="M287.5 116L86 231.5L287.5 347L489 231.5L287.5 116Z" stroke="url(#b)" stroke-width="59" stroke-linejoin="round"/><path d="M86 344L288 229" stroke="url(#c)" stroke-width="59" stroke-linejoin="bevel"/><defs><linearGradient id="a" x1="60" y1="341" x2="429.5" y2="344" gradientUnits="userSpaceOnUse"><stop stop-color="#F9D100"/><stop offset="1" stop-color="#F97700"/></linearGradient><linearGradient id="b" x1="513.5" y1="231" x2="143.5" y2="231" gradientUnits="userSpaceOnUse"><stop stop-color="#F9D100"/><stop offset="1" stop-color="#F97700"/></linearGradient><linearGradient id="c" x1="60" y1="344" x2="428.987" y2="341.811" gradientUnits="userSpaceOnUse"><stop stop-color="#F9D100"/><stop offset="1" stop-color="#F97700"/></linearGradient></defs></svg>"""

# `__LINKS__` is replaced with the links, as JSON. Each link's `href` is
# relative to the app's root, which the script works out from its own URL, so
# the footer works behind a proxy or under a `root_path`.
FOOTER_SCRIPT = """(() => {
	const links = __LINKS__;
	if (!links.length || customElements.get("gradio-footer")) return;
	const script = document.currentScript;
	const root = new URL("../", script ? script.src : location.origin + "/gradio_api/");

	class GradioFooter extends HTMLElement {
		connectedCallback() {
			if (this.shadowRoot) return;
			const shadow = this.attachShadow({ mode: "open" });
			const style = document.createElement("style");
			style.textContent = `
				:host { display: block; }
				footer {
					display: flex;
					justify-content: center;
					align-items: center;
					flex-wrap: wrap;
					gap: 0.5rem;
					padding: 1rem;
					font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
					color: #6b7280;
				}
				a {
					display: inline-flex;
					align-items: center;
					gap: 0.25rem;
					color: inherit;
					text-decoration: none;
				}
				a:hover { color: #111827; }
				svg { width: 1rem; height: 1rem; }
				@media (prefers-color-scheme: dark) {
					footer { color: #9ca3af; }
					a:hover { color: #f3f4f6; }
				}
			`;
			const footer = document.createElement("footer");
			footer.setAttribute("aria-label", "Gradio footer navigation");
			links.forEach((link, i) => {
				if (i > 0) {
					const divider = document.createElement("span");
					divider.setAttribute("aria-hidden", "true");
					divider.textContent = "·";
					footer.append(divider);
				}
				const a = document.createElement("a");
				a.href = new URL(link.href, root).href;
				a.textContent = link.label;
				if (link.external) {
					a.target = "_blank";
					a.rel = "noreferrer";
				}
				if (link.icon) a.insertAdjacentHTML("beforeend", link.icon);
				footer.append(a);
			});
			shadow.append(style, footer);
		}
	}
	customElements.define("gradio-footer", GradioFooter);

	const mount = () => {
		if (!document.querySelector("gradio-footer")) {
			document.body.append(document.createElement("gradio-footer"));
		}
	};
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", mount);
	} else {
		mount();
	}
})();
"""


def footer_links(blocks: Any) -> list[dict[str, Any]]:
    """The links of the footer of a page served outside `Blocks`. The API docs
    and settings live in panels of the `Blocks` page, so they are left out."""
    chosen = getattr(blocks, "footer_links", None)
    if chosen is None:
        chosen = ["api", "gradio", "settings", "runs"]
    links = []
    if (
        "runs" in chosen
        and getattr(blocks, "run_history", True)
        and _components_package.is_installed()
    ):
        links.append({"label": "Runs", "href": "gradio_api/runs"})
    if "gradio" in chosen:
        links.append(
            {
                "label": "Built with Gradio",
                "href": "https://gradio.app",
                "external": True,
                "icon": GRADIO_LOGO,
            }
        )
    return links


def footer_script(blocks: Any) -> str:
    return FOOTER_SCRIPT.replace("__LINKS__", json.dumps(footer_links(blocks)))
