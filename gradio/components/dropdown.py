"""gr.Dropdown() component."""

from __future__ import annotations

import warnings
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components.base import Component, FormComponent
from gradio.events import Events
from gradio.exceptions import Error
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer


class DefaultValue:
    # This sentinel is used to indicate that if the value is not explicitly set,
    # the first choice should be selected in the dropdown if multiselect is False,
    # and an empty list should be selected if multiselect is True.
    pass


DEFAULT_VALUE = DefaultValue()


@document()
class Dropdown(FormComponent):
    """
    Creates a dropdown of choices from which a single entry or multiple entries can be selected (as an input component) or displayed (as an output component).

    Demos: sentence_builder
    """

    EVENTS = [
        Events.change,
        Events.input,
        Events.select,
        Events.focus,
        Events.blur,
        Events.key_up,
    ]

    def __init__(
        self,
        choices: Sequence[str | int | float | tuple[str, str | int | float]]
        | None = None,
        *,
        value: str
        | int
        | float
        | Sequence[str | int | float]
        | Callable
        | DefaultValue
        | None = DEFAULT_VALUE,
        type: Literal["value", "index"] = "value",
        multiselect: bool | None = None,
        allow_custom_value: bool = False,
        max_choices: int | None = None,
        filterable: bool = True,
        label: str | I18nData | None = None,
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
    ):
        """
        Parameters:
            choices: a list of string or numeric options to choose from. An option can also be a tuple of the form (name, value), where name is the displayed name of the dropdown choice and value is the value to be passed to the function, or returned by the function.
            value: the value selected in dropdown. If `multiselect` is true, this should be list, otherwise a single string or number from among `choices`. By default, the first choice in `choices` is initally selected. If set explicitly to None, no value is initally selected. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            type: type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
            multiselect: if True, multiple choices can be selected.
            allow_custom_value: if True, allows user to enter a custom value that is not in the list of choices.
            max_choices: maximum number of choices that can be selected. If None, no limit is enforced.
            filterable: if True, user will be able to type into the dropdown and filter the choices by typing. Can only be set to False if `allow_custom_value` is False.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            info: additional component description, appears below the label in smaller font. Supports markdown / HTML syntax.
            every: continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: if True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, choices in this dropdown will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: if False, component will be hidden.
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: an optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: if False, component will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
        """
        self.choices = (
            # Although we expect choices to be a list of tuples, it can be a list of lists if the Gradio app
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
        self.multiselect = multiselect

        if value == DEFAULT_VALUE:
            if multiselect:
                value = []
            elif self.choices:
                value = self.choices[0][1]
            else:
                value = None
        if multiselect and isinstance(value, str):
            value = [value]

        if not multiselect and max_choices is not None:
            warnings.warn(
                "The `max_choices` parameter is ignored when `multiselect` is False."
            )
        if not filterable and allow_custom_value:
            filterable = True
            warnings.warn(
                "The `filterable` parameter cannot be set to False when `allow_custom_value` is True. Setting `filterable` to True."
            )
        self.max_choices = max_choices
        self.allow_custom_value = allow_custom_value
        self.filterable = filterable
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
        self._value_description = f"one{' or more' if multiselect else ''} of {[c[1] if isinstance(c, tuple) else c for c in self.choices]}"

    def api_info(self) -> dict[str, Any]:
        if self.multiselect:
            json_type = {
                "type": "array",
                "items": {"type": "string", "enum": [c[1] for c in self.choices]},
            }
        else:
            json_type = {
                "type": "string",
                "enum": [c[1] for c in self.choices],
            }
        return json_type

    def example_payload(self) -> Any:
        if self.multiselect:
            return [self.choices[0][1]] if self.choices else []
        else:
            return self.choices[0][1] if self.choices else None

    def example_value(self) -> Any:
        if self.multiselect:
            return [self.choices[0][1]] if self.choices else []
        else:
            return self.choices[0][1] if self.choices else None

    def preprocess(
        self, payload: str | int | float | list[str | int | float] | None
    ) -> str | int | float | list[str | int | float] | list[int | None] | None:
        """
        Parameters:
            payload: the value of the selected dropdown choice(s)
        Returns:
            Passes the value of the selected dropdown choice as a `str | int | float` or its index as an `int` into the function, depending on `type`. Or, if `multiselect` is True, passes the values of the selected dropdown choices as a list of corresponding values/indices instead.
        """
        if payload is None:
            return None

        choice_values = [value for _, value in self.choices]
        if not self.allow_custom_value:
            if isinstance(payload, list):
                for value in payload:
                    if value not in choice_values:
                        raise Error(
                            f"Value: {value!r} (type: {type(value)}) is not in the list of choices: {choice_values}"
                        )
            elif payload not in choice_values:
                raise Error(
                    f"Value: {payload} is not in the list of choices: {choice_values}"
                )

        if self.type == "value":
            return payload
        elif self.type == "index":
            if isinstance(payload, list):
                return [
                    choice_values.index(choice) if choice in choice_values else None
                    for choice in payload
                ]
            else:
                return (
                    choice_values.index(payload) if payload in choice_values else None
                )
        else:
            raise ValueError(
                f"Unknown type: {self.type}. Please choose from: 'value', 'index'."
            )

    def _warn_if_invalid_choice(self, value):
        if self.allow_custom_value or value in [value for _, value in self.choices]:
            return
        warnings.warn(
            f"The value passed into gr.Dropdown() is not in the list of choices. Please update the list of choices to include: {value} or set allow_custom_value=True."
        )

    def postprocess(
        self, value: str | int | float | list[str | int | float] | None
    ) -> str | int | float | list[str | int | float] | None:
        """
        Parameters:
            value: Expects a `str | int | float` corresponding to the value of the dropdown entry to be selected. Or, if `multiselect` is True, expects a `list` of values corresponding to the selected dropdown entries.
        Returns:
            Returns the values of the selected dropdown entry or entries.
        """
        if value is None:
            return None
        if self.multiselect:
            if not isinstance(value, list):
                value = [value]
            [self._warn_if_invalid_choice(_y) for _y in value]
        else:
            self._warn_if_invalid_choice(value)
        return value
