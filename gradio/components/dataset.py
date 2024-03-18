"""gr.Dataset() component."""

from __future__ import annotations

from typing import Any, Literal

from gradio_client.documentation import document

from gradio import processing_utils
from gradio.components.base import (
    Component,
    get_component_instance,
)
from gradio.events import Events


@document()
class Dataset(Component):
    """
    Creates a gallery or table to display data samples. This component is designed for internal use to display examples.
    """

    EVENTS = [Events.click, Events.select]

    def __init__(
        self,
        *,
        label: str | None = None,
        components: list[Component] | list[str],
        component_props: list[dict[str, Any]] | None = None,
        samples: list[list[Any]] | None = None,
        headers: list[str] | None = None,
        type: Literal["values", "index"] = "values",
        samples_per_page: int = 10,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        proxy_url: str | None = None,
    ):
        """
        Parameters:
            label: The label for this component, appears above the component.
            components: Which component types to show in this dataset widget, can be passed in as a list of string names or Components instances. The following components are supported in a Dataset: Audio, Checkbox, CheckboxGroup, ColorPicker, Dataframe, Dropdown, File, HTML, Image, Markdown, Model3D, Number, Radio, Slider, Textbox, TimeSeries, Video
            samples: a nested list of samples. Each sublist within the outer list represents a data sample, and each element within the sublist represents an value for each component
            headers: Column headers in the Dataset widget, should be the same len as components. If not provided, inferred from component labels
            type: 'values' if clicking on a sample should pass the value of the sample, or "index" if it should pass the index of the sample
            samples_per_page: how many examples to show per page.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            proxy_url: The URL of the external Space used to load this component. Set automatically when using `gr.load()`. This should not be set manually.
        """
        super().__init__(
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
        )
        self.container = container
        self.scale = scale
        self.min_width = min_width
        self._components = [get_component_instance(c) for c in components]
        if component_props is None:
            self.component_props = [
                component.recover_kwargs(
                    component.get_config(),
                    ["value"],
                )
                for component in self._components
            ]
        else:
            self.component_props = component_props

        # Narrow type to Component
        if not all(isinstance(c, Component) for c in self._components):
            raise TypeError(
                "All components in a `Dataset` must be subclasses of `Component`"
            )
        self._components = [c for c in self._components if isinstance(c, Component)]
        self.proxy_url = proxy_url
        for component in self._components:
            component.proxy_url = proxy_url
        self.samples = [[]] if samples is None else samples
        for example in self.samples:
            for i, (component, ex) in enumerate(zip(self._components, example)):
                # If proxy_url is set, that means it is being loaded from an external Gradio app
                # which means that the example has already been processed.
                if self.proxy_url is None:
                    # The `as_example()` method has been renamed to `process_example()` but we
                    # use the previous name to be backwards-compatible with previously-created
                    # custom components
                    example[i] = component.as_example(ex)
                example[i] = processing_utils.move_files_to_cache(
                    example[i], component, keep_in_cache=True
                )
        self.type = type
        self.label = label
        if headers is not None:
            self.headers = headers
        elif all(c.label is None for c in self._components):
            self.headers = []
        else:
            self.headers = [c.label or "" for c in self._components]
        self.samples_per_page = samples_per_page

    def api_info(self) -> dict[str, str]:
        return {"type": "integer", "description": "index of selected example"}

    def get_config(self):
        config = super().get_config()

        config["components"] = []
        config["component_props"] = self.component_props
        config["component_ids"] = []

        for component in self._components:
            config["components"].append(component.get_block_name())

            config["component_ids"].append(component._id)

        return config

    def preprocess(self, payload: int) -> int | list | None:
        """
        Parameters:
            payload: the index of the selected example in the dataset
        Returns:
            Passes the selected sample either as a `list` of data corresponding to each input component (if `type` is "value") or as an `int` index (if `type` is "index")
        """
        if self.type == "index":
            return payload
        elif self.type == "values":
            return self.samples[payload]

    def postprocess(self, samples: list[list]) -> dict:
        """
        Parameters:
            samples: Expects a `list[list]` corresponding to the dataset data, can be used to update the dataset.
        Returns:
            Returns the updated dataset data as a `dict` with the key "samples".
        """
        return {
            "samples": samples,
            "__type__": "update",
        }

    def example_payload(self) -> Any:
        return 0

    def example_value(self) -> Any:
        return []
