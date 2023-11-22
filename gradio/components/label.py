"""gr.Label() component."""

from __future__ import annotations

import json
import operator
from pathlib import Path
from typing import Any, Callable, List, Optional, Union

from gradio_client.documentation import document, set_documentation_group

from gradio.components.base import Component
from gradio.data_classes import GradioModel
from gradio.events import Events

set_documentation_group("component")


class LabelConfidence(GradioModel):
    label: Optional[Union[str, int, float]] = None
    confidence: Optional[float] = None


class LabelData(GradioModel):
    label: Optional[Union[str, int, float]] = None
    confidences: Optional[List[LabelConfidence]] = None


@document()
class Label(Component):
    """
    Displays a classification label, along with confidence scores of top categories, if provided.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {Dict[str, float]} of classes and confidences, or {str} with just the class or an {int}/{float} for regression outputs, or a {str} path to a .json file containing a json dictionary in the structure produced by Label.postprocess().

    Demos: main_note, titanic_survival
    Guides: image-classification-in-pytorch, image-classification-in-tensorflow, image-classification-with-vision-transformers
    """

    CONFIDENCES_KEY = "confidences"
    data_model = LabelData
    EVENTS = [Events.change, Events.select]

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
        render: bool = True,
        color: str | None = None,
    ):
        """
        Parameters:
            value: Default value to show in the component. If a str or number is provided, simply displays the string or number. If a {Dict[str, float]} of classes and confidences is provided, displays the top class on top and the `num_top_classes` below, along with their confidence bars. If callable, the function will be called whenever the app loads to set the initial value of the component.
            num_top_classes: number of most confident classes to show.
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
            color: The background color of the label (either a valid css color name or hexadecimal string).
        """
        self.num_top_classes = num_top_classes
        self.color = color
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

    def postprocess(
        self, value: dict[str, float] | str | float | None
    ) -> LabelData | dict | None:
        if value is None or value == {}:
            return {}
        if isinstance(value, str) and value.endswith(".json") and Path(value).exists():
            return LabelData(**json.loads(Path(value).read_text()))
        if isinstance(value, (str, float, int)):
            return LabelData(label=str(value))
        if isinstance(value, dict):
            if "confidences" in value and isinstance(value["confidences"], dict):
                value = value["confidences"]
                value = {c["label"]: c["confidence"] for c in value}
            sorted_pred = sorted(
                value.items(), key=operator.itemgetter(1), reverse=True
            )
            if self.num_top_classes is not None:
                sorted_pred = sorted_pred[: self.num_top_classes]
            return LabelData(
                label=sorted_pred[0][0],
                confidences=[
                    LabelConfidence(label=pred[0], confidence=pred[1])
                    for pred in sorted_pred
                ],
            )
        raise ValueError(
            "The `Label` output interface expects one of: a string label, or an int label, a "
            "float label, or a dictionary whose keys are labels and values are confidences. "
            f"Instead, got a {type(value)}"
        )

    def preprocess(
        self, payload: LabelData | None
    ) -> dict[str, float] | str | float | None:
        if payload is None:
            return None
        if payload.confidences is None:
            return payload.label
        return {
            d["label"]: d["confidence"] for d in payload.model_dump()["confidences"]
        }

    def example_inputs(self) -> Any:
        return {
            "label": "Cat",
            "confidences": [
                {"label": "cat", "confidence": 0.9},
                {"label": "dog", "confidence": 0.1},
            ],
        }
