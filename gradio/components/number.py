"""gr.Number() component."""

from __future__ import annotations

import json
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components.base import Component, FormComponent
from gradio.components.button import Button
from gradio.events import Events
from gradio.exceptions import Error
from gradio.i18n import I18nData
from gradio.utils import set_default_buttons

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class Number(FormComponent):
    """
    Creates a component for entering or displaying numeric values, with optional precision, bounds, and step controls.

    Demos: tax_calculator, blocks_simple_squares
    """

    EVENTS = [Events.change, Events.input, Events.submit, Events.focus, Events.blur]

    def __init__(
        self,
        value: float | Callable | None = None,
        *,
        label: str | I18nData | None = None,
        placeholder: str | I18nData | None = None,
        info: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        buttons: list[Button] | None = None,
        precision: int | None = None,
        minimum: float | None = None,
        maximum: float | None = None,
        step: float = 1,
    ):
        """
        Parameters:
            value: Default value. If None, the component starts empty and shows the `placeholder` when provided. If no `placeholder` is set, the component displays 0. If a function is provided, it is called each time the app loads to set the initial value.
            label: Label shown above the component when `show_label` is True. In `gr.Interface`, if None, the label defaults to the corresponding parameter name.
            placeholder: Placeholder text shown behind the number input.
            info: Additional component description shown below the label in smaller text. Supports markdown and HTML.
            every: Continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated whenever the inputs change.
            show_label: If True, displays the label.
            container: If True, places the component inside a container with extra padding around the border.
            scale: Relative size compared to adjacent components. For example, if components A and B are in a Row, and A has `scale=2` while B has `scale=1`, A will be twice as wide as B. Scale applies in Rows, and to top-level components in Blocks where `fill_height=True`.
            min_width: Minimum pixel width. If a certain scale value would make this component narrower than `min_width`, `min_width` is respected first.
            interactive: If True, the component is editable. If False, editing is disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, the component is hidden. If "hidden", the component is visually hidden and does not take up layout space but still exists in the DOM.
            elem_id: Optional id assigned to this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: Optional list of classes assigned to this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, the component is not rendered in the Blocks context. Use this if you want to attach event listeners now and render the component later.
            key: In a gr.render, components with the same key across re-renders are treated as the same component, not a new one. Properties listed in `preserved_by_key` are not reset across re-renders.
            preserved_by_key: Constructor parameters that should be preserved when the component is re-rendered inside `gr.render()` with the same key.
            precision: Precision used to round input and output values. If set to 0, the value is rounded to the nearest integer and returned as an `int`. If None, no rounding is applied.
            minimum: Minimum allowed value when the component is used as an input. If a user provides a smaller value, a `gr.Error` is raised by the backend.
            maximum: Maximum allowed value when the component is used as an input. If a user provides a larger value, a `gr.Error` is raised by the backend.
            step: Interval between allowed numbers. Can be combined with `minimum` and `maximum` to define a valid numeric range.
            buttons: A list of `gr.Button()` instances to show in the component toolbar. Custom buttons appear in the top-right corner with their configured icon and/or label, and clicking them triggers any registered `.click()` events.
        """
        self.precision = precision
        self.minimum = minimum
        self.maximum = maximum
        self.step = step
        self.placeholder = placeholder

        super().__init__(
            label=label,
            info=info,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
        )
        self.buttons = set_default_buttons(buttons, None)

    @staticmethod
    def round_to_precision(num: float | int, precision: int | None) -> float | int:
        """
        Round to a given precision.

        If precision is None, no rounding happens. If 0, num is converted to int.

        Parameters:
            num: Number to round.
            precision: Precision to round to.
        Returns:
            rounded number or the original number if precision is None
        """
        if precision is None:
            return num
        elif precision == 0:
            return int(round(num, precision))
        else:
            return round(num, precision)

    @staticmethod
    def raise_if_out_of_bounds(
        num: float | int, minimum: float | int | None, maximum: float | int | None
    ) -> None:
        if minimum is not None and num < minimum:
            raise Error(f"Value {num} is less than minimum value {minimum}.")
        if maximum is not None and num > maximum:
            raise Error(f"Value {num} is greater than maximum value {maximum}.")

    def preprocess(self, payload: float | None) -> float | int | None:
        """
        Parameters:
            payload: the field value.
        Returns:
            Passes field value as a `float` or `int` into the function, depending on `precision`.
        """
        if payload is None:
            return None
        self.raise_if_out_of_bounds(payload, self.minimum, self.maximum)
        return self.round_to_precision(payload, self.precision)

    def postprocess(self, value: float | int | None) -> float | int | None:
        """
        Parameters:
            value: Expects an `int` or `float` returned from the function and sets field value to it.
        Returns:
            The (optionally rounded) field value as a `float` or `int` depending on `precision`.
        """
        if value is None:
            return None
        return self.round_to_precision(value, self.precision)

    def api_info(self) -> dict[str, str]:  # type: ignore[override]
        if self.precision == 0:
            return {"type": "integer"}
        return {"type": "number"}

    def example_payload(self) -> Any:
        return self.round_to_precision(
            3 if self.minimum is None else self.minimum, self.precision
        )

    def example_value(self) -> Any:
        return self.round_to_precision(
            3 if self.minimum is None else self.minimum, self.precision
        )

    def read_from_flag(self, payload: str):
        """Numbers are stored as strings in the flagging file, so we need to parse them as json."""
        return json.loads(payload)
