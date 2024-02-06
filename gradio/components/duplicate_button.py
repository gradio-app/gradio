""" Predefined buttons with bound events that can be included in a gr.Blocks for convenience. """

from __future__ import annotations

from typing import Literal

from gradio_client.documentation import document

from gradio.components import Button
from gradio.context import Context
from gradio.utils import get_space


@document()
class DuplicateButton(Button):
    """
    Button that triggers a Spaces Duplication, when the demo is on Hugging Face Spaces. Does nothing locally.
    """

    is_template = True

    def __init__(
        self,
        value: str = "Duplicate Space",
        *,
        every: float | None = None,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "lg"] | None = "sm",
        icon: str | None = None,
        link: str | None = None,
        visible: bool = True,
        interactive: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        scale: int | None = 0,
        min_width: int | None = None,
        _activate: bool = True,
    ):
        """
        Parameters:
            value: Default text for the button to display. If callable, the function will be called whenever the app loads to set the initial value of the component.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            variant: 'primary' for main call-to-action, 'secondary' for a more subdued style, 'stop' for a stop button.
            size: Size of the button. Can be "sm" or "lg".
            icon: URL or path to the icon file to display within the button. If None, no icon will be displayed.
            link: URL to open when the button is clicked. If None, no link will be used.
            visible: If False, component will be hidden.
            interactive: If False, the Button will be in a disabled state.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
        """
        super().__init__(
            value=value,
            every=every,
            variant=variant,
            size=size,
            icon=icon,
            link=link,
            visible=visible,
            interactive=interactive,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            scale=scale,
            min_width=min_width,
        )
        if _activate and Context.root_block:
            self.activate()

    def activate(self):
        space_name = get_space()
        if space_name is not None:
            self.click(
                fn=None,
                js=f"() => {{ window.open(`https://huggingface.co/spaces/{space_name}?duplicate=true`, '_blank') }}",
            )
