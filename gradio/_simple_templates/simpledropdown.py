from __future__ import annotations

import warnings
from typing import Any, Callable

from gradio.components.base import FormComponent
from gradio.events import Events


class SimpleDropdown(FormComponent):
    """
    Creates a very simple dropdown listing choices from which entries can be selected.
    Preprocessing: Preprocessing: passes the value of the selected dropdown entry as a {str}.
    Postprocessing: expects a {str} corresponding to the value of the dropdown entry to be selected.
    Examples-format: a {str} representing the drop down value to select.
    Demos: sentence_builder, titanic_survival
    """

    EVENTS = [Events.change, Events.input, Events.select]

    def __init__(
        self,
        choices: list[str | int | float | tuple[str, str | int | float]] | None = None,
        *,
        value: str | int | float | Callable | None = None,
        label: str | None = None,
        info: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            choices: A list of string options to choose from. An option can also be a tuple of the form (name, value), where name is the displayed name of the dropdown choice and value is the value to be passed to the function, or returned by the function.
            value: default value selected in dropdown. If None, no value is selected by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            info: additional component description.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, choices in this dropdown will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
                    render: bool = True,
        """
        self.choices = (
            # Although we expect choices to be a list of lists, it can be a list of tuples if the Gradio app
            # is loaded with gr.load() since Python tuples are converted to lists in JSON.
            [tuple(c) if isinstance(c, (tuple, list)) else (str(c), c) for c in choices]
            if choices
            else []
        )
        super().__init__(
            label=label,
            info=info,
            every=every,
            show_label=show_label,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            render=render,
        )

    def api_info(self) -> dict[str, Any]:
        return {
            "type": "string",
            "enum": [c[1] for c in self.choices],
        }

    def example_inputs(self) -> Any:
        return self.choices[0][1] if self.choices else None

    def preprocess(self, x: str | int | float | None) -> str | int | float | None:
        """
        Parameters:
            x: selected choice
        Returns:
            selected choice
        """
        return x

    def _warn_if_invalid_choice(self, y):
        if y not in [value for _, value in self.choices]:
            warnings.warn(
                f"The value passed into gr.Dropdown() is not in the list of choices. Please update the list of choices to include: {y}."
            )

    def postprocess(self, y):
        if y is None:
            return None
        self._warn_if_invalid_choice(y)
        return y

    def as_example(self, input_data):
        return next((c[0] for c in self.choices if c[1] == input_data), None)
