"""gr.Dataset() component."""

from __future__ import annotations

import warnings
from collections.abc import Sequence
from typing import Any, Literal

from gradio_client.documentation import document

from gradio import processing_utils
from gradio.components.base import (
    Component,
    get_component_instance,
)
from gradio.events import Events
from gradio.i18n import I18nData


@document()
class Dataset(Component):
    """
    Creates a gallery or table to display data samples. This component is primarily designed for internal use to display examples.
    However, it can also be used directly to display a dataset and let users select examples.
    """

    EVENTS = [Events.click, Events.select]

    def __init__(
        self,
        *,
        label: str | I18nData | None = None,
        show_label: bool = True,
        components: Sequence[Component] | list[str] | None = None,
        component_props: list[dict[str, Any]] | None = None,
        samples: list[list[Any]] | None = None,
        headers: list[str] | None = None,
        type: Literal["values", "index", "tuple"] = "values",
        layout: Literal["gallery", "table"] | None = None,
        samples_per_page: int = 10,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        proxy_url: str | None = None,
        sample_labels: list[str] | None = None,
    ):
        """
        Parameters:
            label: the label for this component, appears above the component.
            show_label: If True, the label will be shown above the component.
            components: Which component types to show in this dataset widget, can be passed in as a list of string names or Components instances. The following components are supported in a Dataset: Audio, Checkbox, CheckboxGroup, ColorPicker, Dataframe, Dropdown, File, HTML, Image, Markdown, Model3D, Number, Radio, Slider, Textbox, TimeSeries, Video
            samples: a nested list of samples. Each sublist within the outer list represents a data sample, and each element within the sublist represents an value for each component
            headers: Column headers in the Dataset widget, should be the same len as components. If not provided, inferred from component labels
            type: "values" if clicking on a sample should pass the value of the sample, "index" if it should pass the index of the sample, or "tuple" if it should pass both the index and the value of the sample.
            layout: "gallery" if the dataset should be displayed as a gallery with each sample in a clickable card, or "table" if it should be displayed as a table with each sample in a row. By default, "gallery" is used if there is a single component, and "table" is used if there are more than one component. If there are more than one component, the layout can only be "table".
            samples_per_page: how many examples to show per page.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            proxy_url: The URL of the external Space used to load this component. Set automatically when using `gr.load()`. This should not be set manually.
            sample_labels: A list of labels for each sample. If provided, the length of this list should be the same as the number of samples, and these labels will be used in the UI instead of rendering the sample values.
        """
        super().__init__(
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
        )
        self.container = container
        self.scale = scale
        self.min_width = min_width
        self.layout = layout
        self.show_label = show_label
        self._components = [get_component_instance(c) for c in components or []]
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
        self.raw_samples = [[]] if samples is None else samples
        self.samples: list[list] = []
        for example in self.raw_samples:
            self.samples.append([])
            for component, ex in zip(self._components, example, strict=False):
                # If proxy_url is set, that means it is being loaded from an external Gradio app
                # which means that the example has already been processed.
                if self.proxy_url is None:
                    # We do not need to process examples if the Gradio app is being loaded from
                    # an external Space because the examples have already been processed. Also,
                    # the `as_example()` method has been renamed to `process_example()` but we
                    # use the previous name to be backwards-compatible with previously-created
                    # custom components
                    ex = component.as_example(ex)
                self.samples[-1].append(
                    processing_utils.move_files_to_cache(
                        ex, component, keep_in_cache=True
                    )
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
        self.sample_labels = sample_labels

    def api_info(self) -> dict[str, str]:
        return {"type": "integer", "description": "index of selected example"}

    def get_config(self):
        config = super().get_config()

        config["components"] = []
        config["component_props"] = self.component_props
        config["sample_labels"] = self.sample_labels
        config["component_ids"] = []

        for component in self._components:
            config["components"].append(component.get_block_name())

            config["component_ids"].append(component._id)

        return config

    def preprocess(self, payload: int | None) -> int | list | tuple[int, list] | None:
        """
        Parameters:
            payload: the index of the selected example in the dataset
        Returns:
            Passes the selected sample either as a `list` of data corresponding to each input component (if `type` is "value") or as an `int` index (if `type` is "index"), or as a `tuple` of the index and the data (if `type` is "tuple").
        """
        if payload is None:
            return None
        if self.type == "index":
            return payload
        elif self.type == "values":
            return self.raw_samples[payload]
        elif self.type == "tuple":
            return payload, self.raw_samples[payload]

    def postprocess(self, value: int | list | None) -> int | None:
        """
        Parameters:
            value: Expects an `int` index or `list` of sample data. Returns the index of the sample in the dataset or `None` if the sample is not found.
        Returns:
            Returns the index of the sample in the dataset.
        """
        if value is None or isinstance(value, int):
            return value
        if isinstance(value, list):
            try:
                index = self.samples.index(value)
            except ValueError:
                index = None
                warnings.warn(
                    "The `Dataset` component does not support updating the dataset data by providing "
                    "a set of list values. Instead, you should return a new Dataset(samples=...) object."
                )
            return index

    def example_payload(self) -> Any:
        return 0

    def example_value(self) -> Any:
        return []
