"""gr.Radio() component."""

from __future__ import annotations

from typing import Any, Callable

from gradio_client.documentation import document

from gradio.components.base import FormComponent
from gradio.events import Events


@document()
class Radio(FormComponent):
    """
    Creates a set of (string or numeric type) radio buttons of which only one can be selected.

    Demos: sentence_builder, blocks_essay
    """

    EVENTS = [Events.select, Events.change, Events.input]

    def __init__(
        self,
        choices: list[str | int | float | tuple[str, str | int | float]] | None = None,
        *,
        value: str | int | float | Callable | None = None,
        type: str = "value",
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
    ):
        """
        Parameters:
            choices: A list of string or numeric options to select from. An option can also be a tuple of the form (name, value), where name is the displayed name of the radio button and value is the value to be passed to the function, or returned by the function.
            value: The option selected by default. If None, no option is selected by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            type: Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            info: Additional component description.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: Relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: Minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: If True, choices in this radio group will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
        """
        self.choices = (
            # Although we expect choices to be a list of tuples, it can be a list of tuples if the Gradio app
            # is loaded with gr.load() since Python tuples are converted to lists in JSON.
            [tuple(c) if isinstance(c, (tuple, list)) else (str(c), c) for c in choices]
            if choices
            else []
        )
        valid_types = ["value", "index"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
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

    def example_payload(self) -> Any:
        return self.choices[0][1] if self.choices else None

    def example_value(self) -> Any:
        return self.choices[0][1] if self.choices else None

    def preprocess(self, payload: str | int | float | None) -> str | int | float | None:
        """
        Parameters:
            payload: Selected choice in the radio group
        Returns:
            Passes the value of the selected radio button as a `str | int | float`, or its index as an `int` into the function, depending on `type`.
        """
        if self.type == "value":
            return payload
        elif self.type == "index":
            if payload is None:
                return None
            else:
                choice_values = [value for _, value in self.choices]
                return (
                    choice_values.index(payload) if payload in choice_values else None
                )
        else:
            raise ValueError(
                f"Unknown type: {self.type}. Please choose from: 'value', 'index'."
            )

    def postprocess(self, value: str | int | float | None) -> str | int | float | None:
        """
        Parameters:
            value: Expects a `str | int | float` corresponding to the value of the radio button to be selected
        Returns:
            The same value
        """
        return value

    def api_info(self) -> dict[str, Any]:
        return {
            "enum": [c[1] for c in self.choices],
            "title": "Radio",
            "type": "string",
        }
