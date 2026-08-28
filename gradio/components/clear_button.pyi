"""Predefined buttons with bound events that can be included in a gr.Blocks for convenience."""

from __future__ import annotations

import copy
import json
from collections.abc import Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components import Button, Component
from gradio.context import get_blocks_context
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.utils import resolve_singleton

if TYPE_CHECKING:
    from gradio.components import Timer

from gradio.events import Dependency

@document("add")
class ClearButton(Button):
    """
    Button that clears the value of a component or a list of components when clicked. It is instantiated with the list of components to clear.
    Preprocessing: passes the button value as a {str} into the function
    Postprocessing: expects a {str} to be returned from a function, which is set as the label of the button
    """

    is_template = True

    def __init__(
        self,
        components: None | Sequence[Component] | Component = None,
        *,
        value: str = "Clear",
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        variant: Literal["primary", "secondary", "stop"] = "secondary",
        size: Literal["sm", "md", "lg"] = "lg",
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
        scale: int | None = None,
        min_width: int | None = None,
        api_name: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "undocumented",
    ):
        """
        Parameters:
            value: default text for the button to display. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            variant: sets the background and text color of the button. Use 'primary' for main call-to-action buttons, 'secondary' for a more subdued style, 'stop' for a stop button, 'huggingface' for a black background with white text, consistent with Hugging Face's button styles.
            size: size of the button. Can be "sm", "md", or "lg".
            icon: URL or path to the icon file to display within the button. If None, no icon will be displayed.
            link: URL to open when the button is clicked. If None, no link will be used.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            interactive: if False, the Button will be in a disabled state.
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: an optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: if False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
        """
        super().__init__(
            value,
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
        self.api_name = api_name
        self.api_visibility = api_visibility

        if get_blocks_context():
            self.add(components)

    def add(self, components: None | Component | Sequence[Component]) -> ClearButton:
        """
        Adds a component or list of components to the list of components that will be cleared when the button is clicked.
        """
        from gradio.components import State  # Avoid circular import

        if not components:
            # This needs to be here because when the ClearButton is created in an gr.Interface, we don't
            # want to create dependencies for it before we have created the dependencies for the submit function.
            # We generally assume that the submit function dependency is the first thing created in an gr.Interface.
            return self

        if isinstance(components, Component):
            components = [components]
        none_values = []
        state_components = []
        initial_states = []
        for component in components:
            if isinstance(component, State):
                state_components.append(component)
                initial_states.append(copy.deepcopy(component.value))
            none = component.postprocess(None)
            if isinstance(none, (GradioModel, GradioRootModel)):
                none = none.model_dump()
            none_values.append(none)
        clear_values = json.dumps(none_values)
        self.click(
            None,
            [],
            components,
            js=f"() => {clear_values}",
            api_name=self.api_name,
            api_visibility="private",  # Pure JS function, no backend
        )
        if state_components:
            self.click(
                lambda: copy.deepcopy(resolve_singleton(initial_states)),
                None,
                state_components,
                api_name=self.api_name,
                api_visibility=self.api_visibility,  # Uses undocumented since it has a backend function
            )
        return self

    def preprocess(self, payload: str | None) -> str | None:
        """
        Parameters:
            payload: string corresponding to the button label
        Returns:
            (Rarely used) the `str` corresponding to the button label when the button is clicked
        """
        return payload

    def postprocess(self, value: str | None) -> str | None:
        """
        Parameters:
            value: string corresponding to the button label
        Returns:
            Expects a `str` value that is set as the button label
        """
        return value

    def example_payload(self) -> Any:
        return "Clear"

    def example_value(self) -> Any:
        return "Clear"
    from typing import Callable, Literal, Sequence, Any, TYPE_CHECKING
    from gradio.blocks import Block
    if TYPE_CHECKING:
        from gradio.components import Timer
        from gradio.components.base import Component