"""gr.Dataset() component."""

from __future__ import annotations

from typing import Any, Literal

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import StringSerializable

from gradio.components.base import (
    Component,
    IOComponent,
    _Keywords,
    get_component_instance,
)
from gradio.events import Clickable, Selectable

set_documentation_group("component")


@document()
class Dataset(Clickable, Selectable, Component, StringSerializable):
    """
    Used to create an output widget for showing datasets. Used to render the examples
    box.
    Preprocessing: passes the selected sample either as a {list} of data (if type="value") or as an {int} index (if type="index")
    Postprocessing: expects a {list} of {lists} corresponding to the dataset data.
    """

    def __init__(
        self,
        *,
        label: str | None = None,
        components: list[IOComponent] | list[str],
        samples: list[list[Any]] | None = None,
        headers: list[str] | None = None,
        type: Literal["values", "index"] = "values",
        samples_per_page: int = 10,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        **kwargs,
    ):
        """
        Parameters:
            components: Which component types to show in this dataset widget, can be passed in as a list of string names or Components instances. The following components are supported in a Dataset: Audio, Checkbox, CheckboxGroup, ColorPicker, Dataframe, Dropdown, File, HTML, Image, Markdown, Model3D, Number, Radio, Slider, Textbox, TimeSeries, Video
            samples: a nested list of samples. Each sublist within the outer list represents a data sample, and each element within the sublist represents an value for each component
            headers: Column headers in the Dataset widget, should be the same len as components. If not provided, inferred from component labels
            type: 'values' if clicking on a sample should pass the value of the sample, or "index" if it should pass the index of the sample
            samples_per_page: how many examples to show per page.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
        """
        Component.__init__(
            self, visible=visible, elem_id=elem_id, elem_classes=elem_classes, **kwargs
        )
        self.container = container
        self.scale = scale
        self.min_width = min_width
        self.components = [get_component_instance(c) for c in components]

        # Narrow type to IOComponent
        assert all(
            isinstance(c, IOComponent) for c in self.components
        ), "All components in a `Dataset` must be subclasses of `IOComponent`"
        self.components = [c for c in self.components if isinstance(c, IOComponent)]
        for component in self.components:
            component.root_url = self.root_url

        self.samples = [[]] if samples is None else samples
        for example in self.samples:
            for i, (component, ex) in enumerate(zip(self.components, example)):
                example[i] = component.as_example(ex)
        self.type = type
        self.label = label
        if headers is not None:
            self.headers = headers
        elif all(c.label is None for c in self.components):
            self.headers = []
        else:
            self.headers = [c.label or "" for c in self.components]
        self.samples_per_page = samples_per_page

    def get_config(self):
        return {
            "components": [component.get_block_name() for component in self.components],
            "headers": self.headers,
            "samples": self.samples,
            "type": self.type,
            "label": self.label,
            "samples_per_page": self.samples_per_page,
            "container": self.container,
            "scale": self.scale,
            "min_width": self.min_width,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        samples: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        visible: bool | None = None,
        label: str | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
    ):
        return {
            "samples": samples,
            "visible": visible,
            "label": label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "__type__": "update",
        }

    def preprocess(self, x: Any) -> Any:
        """
        Any preprocessing needed to be performed on function input.
        """
        if self.type == "index":
            return x
        elif self.type == "values":
            return self.samples[x]

    def postprocess(self, samples: list[list[Any]]) -> dict:
        return {
            "samples": samples,
            "__type__": "update",
        }
