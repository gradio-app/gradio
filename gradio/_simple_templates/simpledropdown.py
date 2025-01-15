from __future__ import annotations

import warnings
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any

from gradio.components.base import Component, FormComponent
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


class SimpleDropdown(FormComponent):
    """
    Creates a very simple dropdown listing choices from which entries can be selected.
    """

    EVENTS = [Events.change, Events.input, Events.select]

    def __init__(
        self,
        choices: list[str | int | float | tuple[str, str | int | float]] | None = None,
        *,
        value: str | int | float | Callable | None = None,
        label: str | None = None,
        info: str | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
    ):
        """
        Parameters:
            choices: A list of string options to choose from. An option can also be a tuple of the form (name, value), where name is the displayed name of the dropdown choice and value is the value to be passed to the function, or returned by the function.
            value: default value selected in dropdown. If None, no value is selected by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            info: additional component description, appears below the label in smaller font. Supports markdown / HTML syntax.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, choices in this dropdown will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
        """
        self.choices = (
            [tuple(c) if isinstance(c, (tuple, list)) else (str(c), c) for c in choices]
            if choices
            else []
        )
        super().__init__(
            label=label,
            info=info,
            every=every,
            inputs=inputs,
            show_label=show_label,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            render=render,
            key=key,
        )

    def api_info(self) -> dict[str, Any]:
        return {
            "type": "string",
            "enum": [c[1] for c in self.choices],
        }

    def example_payload(self) -> Any:
        return self.choices[0][1] if self.choices else None

    def example_value(self) -> Any:
        return self.choices[0][1] if self.choices else None

    def preprocess(self, payload: str | int | float | None) -> str | int | float | None:
        """
        Parameters:
            payload: the value of the selected dropdown choice
        Returns:
            Passes the value of the selected dropdown choice as a `str | int | float`.
        """
        return payload

    def _warn_if_invalid_choice(self, y):
        if y not in [value for _, value in self.choices]:
            warnings.warn(
                f"The value passed into gr.Dropdown() is not in the list of choices. Please update the list of choices to include: {y}."
            )

    def postprocess(self, value):
        """
        Parameters:
            value: Expects a `str | int | float` corresponding to the value of the dropdown entry to be selected.
        Returns:
            Returns the value of the selected dropdown entry.
        """
        if value is None:
            return None
        self._warn_if_invalid_choice(value)
        return value

    def process_example(self, value):
        return next((c[0] for c in self.choices if c[1] == value), None)
