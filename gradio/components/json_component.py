"""gr.JSON() component."""

from __future__ import annotations

import json
from typing import Any, Callable, Literal

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import JSONSerializable

from gradio.components.base import IOComponent, _Keywords
from gradio.deprecation import warn_style_method_deprecation
from gradio.events import (
    Changeable,
)

set_documentation_group("component")


@document()
class JSON(Changeable, IOComponent, JSONSerializable):
    """
    Used to display arbitrary JSON output prettily.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {str} filepath to a file containing valid JSON -- or a {list} or {dict} that is valid JSON

    Demos: zip_to_json, blocks_xray
    """

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
        **kwargs,
    ):
        """
        Parameters:
            value: Default value. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        visible: bool | None = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def postprocess(self, y: dict | list | str | None) -> dict | list | None:
        """
        Parameters:
            y: either a string filepath to a JSON file, or a Python list or dict that can be converted to JSON
        Returns:
            JSON output in Python list or dict format
        """
        if y is None:
            return None
        if isinstance(y, str):
            return json.loads(y)
        else:
            return y

    def style(self, *, container: bool | None = None, **kwargs):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if container is not None:
            self.container = container
        return self
