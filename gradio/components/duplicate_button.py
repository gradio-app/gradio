"""gr.DuplicateButton() component"""

from __future__ import annotations

from collections.abc import Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Literal

from gradio_client.documentation import document

from gradio.components import Button, Component
from gradio.context import get_blocks_context
from gradio.utils import get_space

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class DuplicateButton(Button):
    """
    Creates a button that opens the current Hugging Face Space's duplication page in a new tab, making it easy for users to duplicate your demo. Outside of Spaces, the button renders but does not perform any action.

    Demos: blocks_essay
    """

    is_template = True

    def __init__(
        self,
        value: str = "Duplicate Space",
        *,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        variant: Literal["primary", "secondary", "stop", "huggingface"] = "huggingface",
        size: Literal["sm", "md", "lg"] = "sm",
        icon: str | Path | None = None,
        link: str | None = None,
        link_target: Literal["_self", "_blank", "_parent", "_top"] = "_self",
        visible: bool | Literal["hidden"] = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        scale: int | None = 0,
        min_width: int | None = None,
        _activate: bool = True,
    ):
        """
        Parameters:
            value: Text to display on the button. If a function is provided, the function will be called each time the app loads to set the initial label.
            every: Continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            variant: Sets the button style. Use 'huggingface' to match the Hugging Face Spaces duplicate button styling, or 'primary', 'secondary', or 'stop' for standard button variants.
            size: Size of the button. Can be "sm", "md", or "lg".
            icon: URL or path to an icon file to display inside the button. If None, no icon is shown.
            link: Optional URL to open when the button is clicked. In Spaces, the duplicate action is registered automatically and overrides the need to pass a manual duplication link.
            link_target: The target window for `link`, such as `_blank` or `_self`.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM.
            interactive: If False, the button will be disabled.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: In a gr.render, components with the same key across re-renders are treated as the same component, not a new component. Properties set in `preserved_by_key` are not reset across a re-render.
            preserved_by_key: A list of constructor parameters that should be preserved when this component is re-rendered inside `gr.render()` with the same key.
            scale: Relative size compared to adjacent components. For example, if components A and B are in a Row, and A has scale=2 while B has scale=1, A will be twice as wide as B. Scale applies in Rows, and to top-level components in Blocks where `fill_height=True`.
            min_width: Minimum pixel width. If a certain scale value results in this component being narrower than `min_width`, `min_width` will be respected first.
        """
        super().__init__(
            value=value,
            every=every,
            inputs=inputs,
            variant=variant,
            size=size,
            icon=icon,
            link=link,
            link_target=link_target,
            visible=visible,
            interactive=interactive,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            scale=scale,
            min_width=min_width,
        )
        if _activate and get_blocks_context():
            self.activate()

    def activate(self):
        space_name = get_space()
        if space_name is not None:
            self.click(
                fn=None,
                js=f"() => {{ window.open(`https://huggingface.co/spaces/{space_name}?duplicate=true`, '_blank') }}",
            )
