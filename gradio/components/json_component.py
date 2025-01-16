"""gr.JSON() component."""

from __future__ import annotations

import json
from collections.abc import Callable, Sequence
from typing import (
    TYPE_CHECKING,
    Any,
)

import orjson
from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.data_classes import JsonData
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class JSON(Component):
    """
    Used to display arbitrary JSON output prettily. As this component does not accept user input, it is rarely used as an input component.

    Demos: zip_to_json, blocks_xray
    """

    EVENTS = [Events.change]

    def __init__(
        self,
        value: str | dict | list | Callable | None = None,
        *,
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        open: bool = False,
        show_indices: bool = False,
        height: int | str | None = None,
        max_height: int | str | None = 500,
        min_height: int | str | None = None,
    ):
        """
        Parameters:
            value: Default value as a valid JSON `str` -- or a `list` or `dict` that can be serialized to a JSON string. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            open: If True, all JSON nodes will be expanded when rendered. By default, node levels deeper than 3 are collapsed.
            show_indices: Whether to show numerical indices when displaying the elements of a list within the JSON object.
            height: Height of the JSON component in pixels if a number is passed, or in CSS units if a string is passed. Overflow will be scrollable. If None, the height will be automatically adjusted to fit the content.
        """
        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            value=value,
        )

        self.show_indices = show_indices
        self.open = open
        self.height = height
        self.max_height = max_height
        self.min_height = min_height

    def preprocess(self, payload: dict | list | None) -> dict | list | None:
        """
        Parameters:
            payload: JSON value as a `dict` or `list`
        Returns:
            Passes the JSON value as a `dict` or `list` depending on the value.
        """
        return payload

    def postprocess(self, value: dict | list | str | None) -> JsonData | None:
        """
        Parameters:
            value: Expects a valid JSON `str` -- or a `list` or `dict` that can be serialized to a JSON string. The `list` or `dict` value can contain numpy arrays.
        Returns:
            Returns the JSON as a `list` or `dict`.
        """
        if value is None:
            return None
        if isinstance(value, str):
            return JsonData(orjson.loads(value))
        else:
            # Use orjson to convert NumPy arrays and datetime objects to JSON.
            # This ensures a backward compatibility with the previous behavior.
            # See https://github.com/gradio-app/gradio/pull/8041
            return JsonData(
                orjson.loads(
                    orjson.dumps(
                        value,
                        option=orjson.OPT_SERIALIZE_NUMPY
                        | orjson.OPT_PASSTHROUGH_DATETIME,
                        default=str,
                    )
                )
            )

    def example_payload(self) -> Any:
        return {"foo": "bar"}

    def example_value(self) -> Any:
        return {"foo": "bar"}

    def read_from_flag(self, payload: Any):
        return json.loads(payload)

    def api_info(self) -> dict[str, Any]:
        return {"type": {}, "description": "any valid json"}
