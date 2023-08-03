"""gr.Number() component."""

from __future__ import annotations

import math
from typing import Callable, Literal

import numpy as np
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import NumberSerializable

from gradio.components.base import FormComponent, IOComponent, _Keywords
from gradio.events import (
    Changeable,
    Focusable,
    Inputable,
    Submittable,
)
from gradio.exceptions import Error
from gradio.interpretation import NeighborInterpretable

set_documentation_group("component")


@document()
class Number(
    FormComponent,
    Changeable,
    Inputable,
    Submittable,
    Focusable,
    IOComponent,
    NumberSerializable,
    NeighborInterpretable,
):
    """
    Creates a numeric field for user to enter numbers as input or display numeric output.
    Preprocessing: passes field value as a {float} or {int} into the function, depending on `precision`.
    Postprocessing: expects an {int} or {float} returned from the function and sets field value to it.
    Examples-format: a {float} or {int} representing the number's value.

    Demos: tax_calculator, titanic_survival, blocks_simple_squares
    """

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
        precision: int | None = None,
        minimum: float | None = None,
        maximum: float | None = None,
        step: float = 1,
        **kwargs,
    ):
        """
        Parameters:
            value: default value. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
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
            precision: Precision to round input/output to. If set to 0, will round to nearest integer and convert type to int. If None, no rounding happens.
            minimum: Minimum value. Only applied when component is used as an input. If a user provides a smaller value, a gr.Error exception is raised by the backend.
            maximum: Maximum value. Only applied when component is used as an input. If a user provides a larger value, a gr.Error exception is raised by the backend.
            step: The interval between allowed numbers in the component. Can be used along with optional parameters `minimum` and `maximum` to create a range of legal values starting from `minimum` and incrementing according to this parameter.
        """
        self.precision = precision
        self.minimum = minimum
        self.maximum = maximum
        self.step = step

        IOComponent.__init__(
            self,
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
            value=value,
            **kwargs,
        )
        NeighborInterpretable.__init__(self)

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

    def get_config(self):
        return {
            "value": self.value,
            "minimum": self.minimum,
            "maximum": self.maximum,
            "step": self.step,
            "container": self.container,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: float | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        minimum: float | None = None,
        maximum: float | None = None,
        step: float = 1,
        label: str | None = None,
        info: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool | None = None,
        visible: bool | None = None,
    ):
        return {
            "label": label,
            "info": info,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "minimum": minimum,
            "maximum": maximum,
            "step": step,
            "interactive": interactive,
            "__type__": "update",
        }

    def preprocess(self, x: float | None) -> float | None:
        """
        Parameters:
            x: numeric input
        Returns:
            number representing function input
        """
        if x is None:
            return None
        elif self.minimum is not None and x < self.minimum:
            raise Error(f"Value {x} is less than minimum value {self.minimum}.")
        elif self.maximum is not None and x > self.maximum:
            raise Error(f"Value {x} is greater than maximum value {self.maximum}.")
        return self._round_to_precision(x, self.precision)

    def postprocess(self, y: float | None) -> float | None:
        """
        Any postprocessing needed to be performed on function output.

        Parameters:
            y: numeric output
        Returns:
            number representing function output
        """
        if y is None:
            return None
        return self._round_to_precision(y, self.precision)

    def set_interpret_parameters(
        self, steps: int = 3, delta: float = 1, delta_type: str = "percent"
    ):
        """
        Calculates interpretation scores of numeric values close to the input number.
        Parameters:
            steps: Number of nearby values to measure in each direction (above and below the input number).
            delta: Size of step in each direction between nearby values.
            delta_type: "percent" if delta step between nearby values should be a calculated as a percent, or "absolute" if delta should be a constant step change.
        """
        self.interpretation_steps = steps
        self.interpretation_delta = delta
        self.interpretation_delta_type = delta_type
        return self

    def get_interpretation_neighbors(self, x: float | int) -> tuple[list[float], dict]:
        x = self._round_to_precision(x, self.precision)
        if self.interpretation_delta_type == "percent":
            delta = 1.0 * self.interpretation_delta * x / 100
        elif self.interpretation_delta_type == "absolute":
            delta = self.interpretation_delta
        else:
            delta = self.interpretation_delta
        if self.precision == 0 and math.floor(delta) != delta:
            raise ValueError(
                f"Delta value {delta} is not an integer and precision=0. Cannot generate valid set of neighbors. "
                "If delta_type='percent', pick a value of delta such that x * delta is an integer. "
                "If delta_type='absolute', pick a value of delta that is an integer."
            )
        # run_interpretation will preprocess the neighbors so no need to convert to int here
        negatives = (
            np.array(x) + np.arange(-self.interpretation_steps, 0) * delta
        ).tolist()
        positives = (
            np.array(x) + np.arange(1, self.interpretation_steps + 1) * delta
        ).tolist()
        return negatives + positives, {}

    def get_interpretation_scores(
        self, x: float, neighbors: list[float], scores: list[float | None], **kwargs
    ) -> list[tuple[float, float | None]]:
        """
        Returns:
            Each tuple set represents a numeric value near the input and its corresponding interpretation score.
        """
        interpretation = list(zip(neighbors, scores))
        interpretation.insert(int(len(interpretation) / 2), (x, None))
        return interpretation
