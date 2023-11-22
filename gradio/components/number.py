"""gr.Number() component."""

from __future__ import annotations

from typing import Any, Callable

from gradio_client.documentation import document, set_documentation_group

from gradio.components.base import FormComponent
from gradio.events import Events
from gradio.exceptions import Error

set_documentation_group("component")


@document()
class Number(FormComponent):
    """
    Creates a numeric field for user to enter numbers as input or display numeric output.
    Preprocessing: passes field value as a {float} or {int} into the function, depending on `precision`.
    Postprocessing: expects an {int} or {float} returned from the function and sets field value to it.
    Examples-format: a {float} or {int} representing the number's value.

    Demos: tax_calculator, titanic_survival, blocks_simple_squares
    """

    EVENTS = [Events.change, Events.input, Events.submit, Events.focus]

    def __init__(
        self,
        value: float | Callable | None = None,
        *,
        label: str | None = None,
        info: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        precision: int | None = None,
        minimum: float | None = None,
        maximum: float | None = None,
        step: float = 1,
    ):
        """
        Parameters:
            value: default value. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            info: additional component description.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will be editable; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            precision: Precision to round input/output to. If set to 0, will round to nearest integer and convert type to int. If None, no rounding happens.
            minimum: Minimum value. Only applied when component is used as an input. If a user provides a smaller value, a gr.Error exception is raised by the backend.
            maximum: Maximum value. Only applied when component is used as an input. If a user provides a larger value, a gr.Error exception is raised by the backend.
            step: The interval between allowed numbers in the component. Can be used along with optional parameters `minimum` and `maximum` to create a range of legal values starting from `minimum` and incrementing according to this parameter.
        """
        self.precision = precision
        self.minimum = minimum
        self.maximum = maximum
        self.step = step

        super().__init__(
            label=label,
            info=info,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
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
            rounded number
        """
        if precision is None:
            return float(num)
        elif precision == 0:
            return int(round(num, precision))
        else:
            return round(num, precision)

    def preprocess(self, payload: float | None) -> float | None:
        if payload is None:
            return None
        elif self.minimum is not None and payload < self.minimum:
            raise Error(f"Value {payload} is less than minimum value {self.minimum}.")
        elif self.maximum is not None and payload > self.maximum:
            raise Error(
                f"Value {payload} is greater than maximum value {self.maximum}."
            )
        return self._round_to_precision(payload, self.precision)

    def postprocess(self, value: float | None) -> float | None:
        if value is None:
            return None
        return self._round_to_precision(value, self.precision)

    def api_info(self) -> dict[str, str]:
        return {"type": "number"}

    def example_inputs(self) -> Any:
        return 3
