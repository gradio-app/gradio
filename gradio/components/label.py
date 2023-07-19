"""gr.Label() component."""

from __future__ import annotations

import operator
from pathlib import Path
from typing import Callable, Literal

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import (
    JSONSerializable,
)

from gradio.components.base import IOComponent, _Keywords
from gradio.deprecation import warn_style_method_deprecation
from gradio.events import (
    Changeable,
    EventListenerMethod,
    Selectable,
)

set_documentation_group("component")


@document()
class Label(Changeable, Selectable, IOComponent, JSONSerializable):
    """
    Displays a classification label, along with confidence scores of top categories, if provided.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {Dict[str, float]} of classes and confidences, or {str} with just the class or an {int}/{float} for regression outputs, or a {str} path to a .json file containing a json dictionary in the structure produced by Label.postprocess().

    Demos: main_note, titanic_survival
    Guides: image-classification-in-pytorch, image-classification-in-tensorflow, image-classification-with-vision-transformers, building-a-pictionary-app
    """

    CONFIDENCES_KEY = "confidences"

    def __init__(
        self,
        value: dict[str, float] | str | float | Callable | None = None,
        *,
        num_top_classes: int | None = None,
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        color: str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value to show in the component. If a str or number is provided, simply displays the string or number. If a {Dict[str, float]} of classes and confidences is provided, displays the top class on top and the `num_top_classes` below, along with their confidence bars. If callable, the function will be called whenever the app loads to set the initial value of the component.
            num_top_classes: number of most confident classes to show.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            color: The background color of the label (either a valid css color name or hexadecimal string).
        """
        self.num_top_classes = num_top_classes
        self.color = color
        self.select: EventListenerMethod
        """
        Event listener for when the user selects a category from Label.
        Uses event data gradio.SelectData to carry `value` referring to name of selected category, and `index` to refer to index.
        See EventData documentation on how to use this event data.
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
            "num_top_classes": self.num_top_classes,
            "value": self.value,
            "color": self.color,
            "selectable": self.selectable,
            **IOComponent.get_config(self),
        }

    def postprocess(self, y: dict[str, float] | str | float | None) -> dict | None:
        """
        Parameters:
            y: a dictionary mapping labels to confidence value, or just a string/numerical label by itself
        Returns:
            Object with key 'label' representing primary label, and key 'confidences' representing a list of label-confidence pairs
        """
        if y is None or y == {}:
            return {}
        if isinstance(y, str) and y.endswith(".json") and Path(y).exists():
            return self.serialize(y)
        if isinstance(y, (str, float, int)):
            return {"label": str(y)}
        if isinstance(y, dict):
            if "confidences" in y and isinstance(y["confidences"], dict):
                y = y["confidences"]
                y = {c["label"]: c["confidence"] for c in y}
            sorted_pred = sorted(y.items(), key=operator.itemgetter(1), reverse=True)
            if self.num_top_classes is not None:
                sorted_pred = sorted_pred[: self.num_top_classes]
            return {
                "label": sorted_pred[0][0],
                "confidences": [
                    {"label": pred[0], "confidence": pred[1]} for pred in sorted_pred
                ],
            }
        raise ValueError(
            "The `Label` output interface expects one of: a string label, or an int label, a "
            "float label, or a dictionary whose keys are labels and values are confidences. "
            f"Instead, got a {type(y)}"
        )

    @staticmethod
    def update(
        value: dict[str, float]
        | str
        | float
        | Literal[_Keywords.NO_VALUE]
        | None = _Keywords.NO_VALUE,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        visible: bool | None = None,
        color: str | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
    ):
        # If color is not specified (NO_VALUE) map it to None so that
        # it gets filtered out in postprocess. This will mean the color
        # will not be updated in the front-end
        if color is _Keywords.NO_VALUE:
            color = None
        # If the color was specified by the developer as None
        # Map is so that the color is updated to be transparent,
        # e.g. no background default state.
        elif color is None:
            color = "transparent"
        return {
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "color": color,
            "__type__": "update",
        }

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
