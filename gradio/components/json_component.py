"""gr.JSON() component."""

from __future__ import annotations

import json
from typing import Any, Callable

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events


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
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            value: Default value. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
        """
        super().__init__(
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            value=value,
        )

    def preprocess(self, payload: dict | list | None) -> dict | list | None:
        """
        Parameters:
            payload: JSON value as a `dict` or `list`
        Returns:
            Passes the JSON value as a `dict` or `list` depending on the value.
        """
        return payload

    def postprocess(self, value: dict | list | str | None) -> dict | list | None:
        """
        Parameters:
            value: Expects a `str` filepath to a file containing valid JSON -- or a `list` or `dict` that is valid JSON
        Returns:
            Returns the JSON as a `list` or `dict`.
        """
        if value is None:
            return None
        if isinstance(value, str):
            return json.loads(value)
        else:
            return value

    def example_payload(self) -> Any:
        return {"foo": "bar"}

    def example_value(self) -> Any:
        return {"foo": "bar"}

    def read_from_flag(self, payload: Any):
        return json.loads(payload)

    def api_info(self) -> dict[str, Any]:
        return {"type": {}, "description": "any valid json"}
