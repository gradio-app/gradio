"""gr.Number() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any

from gradio_client.documentation import document

from gradio.components.base import Component, FormComponent
from gradio.events import Events
from gradio.exceptions import Error
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class Number(FormComponent):
    """
    Creates a numeric field for user to enter numbers as input or display numeric output.

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
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        precision: int | None = None,
        minimum: float | None = None,
        maximum: float | None = None,
        step: float = 1,
    ):
        """
        Parameters:
            value: default value. If None, the component will be empty and show the `placeholder` if is set. If no `placeholder` is set, the component will show 0. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            placeholder: placeholder hint to provide behind number input.
            info: additional component description, appears below the label in smaller font. Supports markdown / HTML syntax.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will be editable; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            precision: Precision to round input/output to. If set to 0, will round to nearest integer and convert type to int. If None, no rounding happens.
            minimum: Minimum value. Only applied when component is used as an input. If a user provides a smaller value, a gr.Error exception is raised by the backend.
            maximum: Maximum value. Only applied when component is used as an input. If a user provides a larger value, a gr.Error exception is raised by the backend.
            step: The interval between allowed numbers in the component. Can be used along with optional parameters `minimum` and `maximum` to create a range of legal values starting from `minimum` and incrementing according to this parameter.
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

    @staticmethod
    def _round_to_precision(num: float | int, precision: int | None) -> float | int:
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

    def preprocess(self, payload: float | None) -> float | int | None:
        """
        Parameters:
            payload: the field value.
        Returns:
            Passes field value as a `float` or `int` into the function, depending on `precision`.
        """
        if payload is None:
            return None
        elif self.minimum is not None and payload < self.minimum:
            raise Error(f"Value {payload} is less than minimum value {self.minimum}.")
        elif self.maximum is not None and payload > self.maximum:
            raise Error(
                f"Value {payload} is greater than maximum value {self.maximum}."
            )
        return self._round_to_precision(payload, self.precision)

    def postprocess(self, value: float | int | None) -> float | int | None:
        """
        Parameters:
            value: Expects an `int` or `float` returned from the function and sets field value to it.
        Returns:
            The (optionally rounded) field value as a `float` or `int` depending on `precision`.
        """
        if value is None:
            return None
        return self._round_to_precision(value, self.precision)

    def api_info(self) -> dict[str, str]:
        return {"type": "number"}

    def example_payload(self) -> Any:
        return 3

    def example_value(self) -> Any:
        return 3
