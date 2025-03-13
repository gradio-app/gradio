"""Predefined button to copy a shareable link to the current Gradio Space."""

from __future__ import annotations

from collections.abc import Sequence
from pathlib import Path
from typing import Literal

from gradio_client.documentation import document

from gradio import utils
from gradio.components import Button, Component
from gradio.context import get_blocks_context


@document()
class ShareLinkButton(Button):
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
        variant: Literal["primary", "secondary", "stop"] = "primary",
        size: Literal["sm", "md", "lg"] = "lg",
        icon: str | Path | None = utils.get_icon_path("link.svg"),
        link: str | None = None,
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,  # noqa: ARG002
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        scale: int | None = None,
        min_width: int | None = None,
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
            scale=scale,
            min_width=min_width,
        )
        self.elem_id: str
        self.n_created += 1
        if get_blocks_context():
            self.activate()

    def activate(self):
        """Attach the click event to copy the share link."""
        _js = self.get_share_link(self.value, self.copied_value)
        import time
        self.click(fn=None, inputs=[], outputs=[self], js=_js)
        self.click(
            fn=lambda: time.sleep(1) or self.value, inputs=[], outputs=[self],
            queue=False
        )

    def get_share_link(
        self, value: str = "Share via Link", copied_value: str = "Link Copied!"
    ):
        import textwrap

        return textwrap.dedent(
            """
        () => {
            console.log("HERE");
            const sessionHash = window.__gradio_session_hash__;
            const currentUrl = new URL(window.location.href);

            // Set the share parameter
            currentUrl.searchParams.set('share', sessionHash);

            // Copy to clipboard
            navigator.clipboard.writeText(currentUrl.toString());

            // Return the copied value immediately for UI feedback
            return "BUTTON_COPIED_VALUE";
        }
    """.replace("BUTTON_DEFAULT_VALUE", value).replace(
                "BUTTON_COPIED_VALUE", copied_value
            )
        ).replace("ID", self.elem_id)
