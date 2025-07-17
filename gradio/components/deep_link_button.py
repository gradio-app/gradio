"""Predefined button to copy a shareable link to the current Gradio Space."""

from __future__ import annotations

import textwrap
import time
from collections.abc import Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Literal

from gradio_client.documentation import document

from gradio import utils
from gradio.components.base import Component
from gradio.components.button import Button
from gradio.context import get_blocks_context

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class DeepLinkButton(Button):
    """
    Creates a button that copies a shareable link to the current Gradio Space.
    The link includes the current session hash as a query parameter.
    """

    is_template = True
    n_created = 0

    def __init__(
        self,
        value: str = "Share via Link",
        copied_value: str = "Link Copied!",
        *,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        variant: Literal["primary", "secondary"] = "secondary",
        size: Literal["sm", "md", "lg"] = "lg",
        icon: str | Path | None = utils.get_icon_path("link.svg"),
        link: str | None = None,
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,  # noqa: ARG002
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        scale: int | None = None,
        min_width: int | None = None,
        every: Timer | float | None = None,
    ):
        """
        Parameters:
            value: The text to display on the button.
            copied_value: The text to display on the button after the link has been copied.
        """
        self.copied_value = copied_value
        super().__init__(
            value,
            inputs=inputs,
            variant=variant,
            size=size,
            icon=icon,
            link=link,
            visible=visible,
            interactive=interactive,
            elem_id=f"gradio-share-link-button-{self.n_created}",
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            scale=scale,
            min_width=min_width,
            every=every,
        )
        self.elem_id: str
        self.n_created += 1
        if get_blocks_context():
            self.activate()

    def activate(self):
        """Attach the click event to copy the share link."""
        _js = self.get_share_link(self.value, self.copied_value)
        # Need to separate events because can't run .then in a pure js
        # function.
        self.click(fn=None, inputs=[], outputs=[self], js=_js)
        self.click(
            fn=lambda: time.sleep(1) or self.value,
            inputs=[],
            outputs=[self],
            queue=False,
            show_api=False,
        )

    def get_share_link(
        self, value: str = "Share via Link", copied_value: str = "Link Copied!"
    ):
        delete_sign_line = (
            "currentUrl.searchParams.delete('__sign');" if utils.get_space() else ""
        )
        return textwrap.dedent(
            f"""
        () => {{
            const sessionHash = window.__gradio_session_hash__;
            fetch(`/gradio_api/deep_link?session_hash=${{sessionHash}}`)
                .then(response => {{
                    if (!response.ok) {{
                        throw new Error('Network response was not ok');
                    }}
                    return response.text();
                }})
                .then(data => {{
                    const currentUrl = new URL(window.location.href);
                    const cleanData = data.replace(/^"|"$/g, '');
                    if (cleanData) {{
                        currentUrl.searchParams.set('deep_link', cleanData);
                    }}
                    {delete_sign_line}
                    navigator.clipboard.writeText(currentUrl.toString());
                }})
                .catch(error => {{
                    console.error('Error fetching deep link:', error);
                    return "Error";
                }});

            return "BUTTON_COPIED_VALUE";
        }}
        """.replace("BUTTON_DEFAULT_VALUE", value).replace(
                "BUTTON_COPIED_VALUE", copied_value
            )
        ).replace("ID", self.elem_id)
