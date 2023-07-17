"""gr.Slider() component."""

from __future__ import annotations

import math
import random
from typing import Any, Callable, Literal

import numpy as np
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import NumberSerializable

from gradio.components.base import FormComponent, IOComponent, _Keywords
from gradio.deprecation import warn_style_method_deprecation
from gradio.events import Changeable, Inputable, Releaseable
from gradio.interpretation import NeighborInterpretable

set_documentation_group("component")


@document()
class Slider(
    FormComponent,
    Changeable,
    Inputable,
    Releaseable,
    IOComponent,
    NumberSerializable,
    NeighborInterpretable,
):
    """
    Creates a slider that ranges from `minimum` to `maximum` with a step size of `step`.
    Preprocessing: passes slider value as a {float} into the function.
    Postprocessing: expects an {int} or {float} returned from function and sets slider value to it as long as it is within range.
    Examples-format: A {float} or {int} representing the slider's value.

    Demos: sentence_builder, slider_release, generate_tone, titanic_survival, interface_random_slider, blocks_random_slider
    Guides: create-your-own-friends-with-a-gan
    """

    def __init__(
        self,
        minimum: float = 0,
        maximum: float = 100,
        value: float | Callable | None = None,
        *,
        step: float | None = None,
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
        randomize: bool = False,
        **kwargs,
    ):
        """
        Parameters:
            minimum: minimum value for slider.
            maximum: maximum value for slider.
            value: default value. If callable, the function will be called whenever the app loads to set the initial value of the component. Ignored if randomized=True.
            step: increment between slider values.
            label: component name in interface.
            info: additional component description.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, slider will be adjustable; if False, adjusting will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            randomize: If True, the value of the slider when the app loads is taken uniformly at random from the range given by the minimum and maximum.
        """
        self.minimum = minimum
        self.maximum = maximum
        if step is None:
            difference = maximum - minimum
            power = math.floor(math.log10(difference) - 2)
            self.step = 10**power
        else:
            self.step = step
        if randomize:
            value = self.get_random_value
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

    def api_info(self) -> dict[str, dict | bool]:
        return {
            "info": {
                "type": "number",
                "description": f"numeric value between {self.minimum} and {self.maximum}",
            },
            "serialized_info": False,
        }

    def example_inputs(self) -> dict[str, Any]:
        return {
            "raw": self.minimum,
            "serialized": self.minimum,
        }

    def get_config(self):
        return {
            "minimum": self.minimum,
            "maximum": self.maximum,
            "step": self.step,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    def get_random_value(self):
        n_steps = int((self.maximum - self.minimum) / self.step)
        step = random.randint(0, n_steps)
        value = self.minimum + step * self.step
        # Round to number of decimals in step so that UI doesn't display long decimals
        n_decimals = max(str(self.step)[::-1].find("."), 0)
        if n_decimals:
            value = round(value, n_decimals)
        return value

    @staticmethod
    def update(
        value: float | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        minimum: float | None = None,
        maximum: float | None = None,
        step: float | None = None,
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
            "minimum": minimum,
            "maximum": maximum,
            "step": step,
            "label": label,
            "info": info,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }

    def postprocess(self, y: float | None) -> float | None:
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
            y: numeric output
        Returns:
            numeric output or minimum number if None
        """
        return self.minimum if y is None else y

    def set_interpret_parameters(self, steps: int = 8) -> Slider:
        """
        Calculates interpretation scores of numeric values ranging between the minimum and maximum values of the slider.
        Parameters:
            steps: Number of neighboring values to measure between the minimum and maximum values of the slider range.
        """
        self.interpretation_steps = steps
        return self

    def get_interpretation_neighbors(self, x) -> tuple[object, dict]:
        return (
            np.linspace(self.minimum, self.maximum, self.interpretation_steps).tolist(),
            {},
        )

    def style(
        self,
        *,
        container: bool | None = None,
    ):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if container is not None:
            self.container = container
        return self
