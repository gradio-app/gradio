"""gr.JSON() component."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Callable

from gradio_client.documentation import document, set_documentation_group

from gradio.components.base import Component
from gradio.events import Events

set_documentation_group("component")


@document()
class JSON(Component):
    """
    Used to display arbitrary JSON output prettily.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {str} filepath to a file containing valid JSON -- or a {list} or {dict} that is valid JSON

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
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
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

    def postprocess(self, value: dict | list | str | None) -> dict | list | None:
        if value is None:
            return None
        if isinstance(value, str):
            return json.loads(value)
        else:
            return value

    def preprocess(self, payload: dict | list | str | None) -> dict | list | str | None:
        return payload

    def example_inputs(self) -> Any:
        return {"foo": "bar"}

    def flag(self, payload: Any, flag_dir: str | Path = "") -> str:
        return json.dumps(payload)

    def read_from_flag(self, payload: Any, flag_dir: str | Path | None = None):
        return json.loads(payload)

    def api_info(self) -> dict[str, Any]:
        return {"type": {}, "description": "any valid json"}
