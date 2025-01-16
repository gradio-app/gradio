"""gr.Slider() component."""

from __future__ import annotations

import math
import random
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any

from gradio_client.documentation import document

from gradio.components.base import Component, FormComponent
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class Slider(FormComponent):
    """
    Creates a slider that ranges from {minimum} to {maximum} with a step size of {step}.

    Demos: sentence_builder, slider_release, interface_random_slider, blocks_random_slider
    Guides: create-your-own-friends-with-a-gan
    """

    EVENTS = [Events.change, Events.input, Events.release]

    def __init__(
        self,
        minimum: float = 0,
        maximum: float = 100,
        value: float | Callable | None = None,
        *,
        step: float | None = None,
        label: str | None = None,
        info: str | None = None,
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
        key: int | str | None = None,
        randomize: bool = False,
        show_reset_button: bool = True,
    ):
        """
        Parameters:
            minimum: minimum value for slider.
            maximum: maximum value for slider.
            value: default value for slider. If a function is provided, the function will be called each time the app loads to set the initial value of this component. Ignored if randomized=True.
            step: increment between slider values.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            info: additional component description, appears below the label in smaller font. Supports markdown / HTML syntax.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, slider will be adjustable; if False, adjusting will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            randomize: If True, the value of the slider when the app loads is taken uniformly at random from the range given by the minimum and maximum.
            show_reset_button: if False, will hide button to reset slider to default value.
        """
        self.minimum = minimum
        self.maximum = maximum
        if step is None:
            difference = maximum - minimum
            power = math.floor(math.log10(difference) - 2)
            self.step = 10**power
        else:
            self.step = step
        self.show_reset_button = show_reset_button
        if randomize:
            value = self.get_random_value
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
            value=value,
        )

    def api_info(self) -> dict[str, Any]:
        return {
            "type": "number",
            "description": f"numeric value between {self.minimum} and {self.maximum}",
        }

    def example_payload(self) -> Any:
        return self.minimum

    def example_value(self) -> Any:
        return self.minimum

    def get_random_value(self):
        n_steps = int((self.maximum - self.minimum) / self.step)
        step = random.randint(0, n_steps)
        value = self.minimum + step * self.step
        # Round to number of decimals in step so that UI doesn't display long decimals
        n_decimals = max(str(self.step)[::-1].find("."), 0)
        if n_decimals:
            value = round(value, n_decimals)
        return value

    def postprocess(self, value: float | None) -> float:
        """
        Parameters:
            value: Expects an {int} or {float} returned from function and sets slider value to it as long as it is within range (otherwise, sets to minimum value).
        Returns:
            The value of the slider within the range.
        """
        return self.minimum if value is None else value

    def preprocess(self, payload: float) -> float:
        """
        Parameters:
            payload: slider value
        Returns:
            Passes slider value as a {float} into the function.
        """
        return payload
