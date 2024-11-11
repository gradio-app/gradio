"""Contains all of the components that can be used with Gradio Interface / Blocks.
Along with the docs for each component, you can find the names of example demos that use
each component. These demos are located in the `demo` directory."""

from __future__ import annotations

import abc
import hashlib
import json
import sys
import warnings
from abc import ABC, abstractmethod
from collections.abc import Callable, Sequence
from enum import Enum
from pathlib import Path
from typing import TYPE_CHECKING, Any

import gradio_client.utils as client_utils

from gradio import utils
from gradio.blocks import Block, BlockContext
from gradio.component_meta import ComponentMeta
from gradio.data_classes import (
    BaseModel,
    DeveloperPath,
    FileData,
    FileDataDict,
    GradioDataModel,
    MediaStreamChunk,
)
from gradio.events import EventListener
from gradio.layouts import Form
from gradio.processing_utils import move_files_to_cache

if TYPE_CHECKING:
    from typing import TypedDict

    class DataframeData(TypedDict):
        headers: list[str]
        data: list[list[str | int | bool]]

    from gradio.components import Timer


class _Keywords(Enum):
    NO_VALUE = "NO_VALUE"  # Used as a sentinel to determine if nothing is provided as a argument for `value` in `Component.update()`
    FINISHED_ITERATING = "FINISHED_ITERATING"  # Used to skip processing of a component's value (needed for generators + state)


class ComponentBase(ABC, metaclass=ComponentMeta):
    EVENTS: list[EventListener | str] = []

    @abstractmethod
    def preprocess(self, payload: Any) -> Any:
        """
        Any preprocessing needed to be performed on function input.
        Parameters:
            payload: The input data received by the component from the frontend.
        Returns:
            The preprocessed input data sent to the user's function in the backend.
        """
        return payload

    @abstractmethod
    def postprocess(self, value):
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
            value: The output data received by the component from the user's function in the backend.
        Returns:
            The postprocessed output data sent to the frontend.
        """
        return value

    @abstractmethod
    def process_example(self, value):
        """
        Process the input data in a way that can be displayed by the examples dataset component in the front-end.

        For example, only return the name of a file as opposed to a full path. Or get the head of a dataframe.
        The return value must be able to be json-serializable to put in the config.
        """
        pass

    @abstractmethod
    def api_info(self) -> dict[str, list[str]]:
        """
        The typing information for this component as a dictionary whose values are a list of 2 strings: [Python type, language-agnostic description].
        Keys of the dictionary are: raw_input, raw_output, serialized_input, serialized_output
        """
        pass

    @abstractmethod
    def example_inputs(self) -> Any:
        """
        Deprecated and replaced by `example_payload()` and `example_value()`.
        """
        pass

    @abstractmethod
    def flag(self, payload: Any | GradioDataModel, flag_dir: str | Path = "") -> str:
        """
        Write the component's value to a format that can be stored in a csv or jsonl format for flagging.
        """
        pass

    @abstractmethod
    def read_from_flag(self, payload: Any) -> GradioDataModel | Any:
        """
        Convert the data from the csv or jsonl file into the component state.
        """
        return payload

    @property
    @abstractmethod
    def skip_api(self) -> bool:
        """Whether this component should be skipped from the api return value"""

    @classmethod
    def has_event(cls, event: str | EventListener) -> bool:
        return event in cls.EVENTS

    @classmethod
    def get_component_class_id(cls) -> str:
        module_name = cls.__module__
        module_path = sys.modules[module_name].__file__
        module_hash = hashlib.md5(f"{cls.__name__}_{module_path}".encode()).hexdigest()
        return module_hash


def server(fn):
    fn._is_server_fn = True
    return fn


class Component(ComponentBase, Block):
    """
    A base class for defining methods that all input/output components should have.
    """

    def __init__(
        self,
        value: Any = None,
        *,
        label: str | None = None,
        info: str | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        load_fn: Callable | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
    ):
        self.server_fns = [
            getattr(self, value)
            for value in dir(self.__class__)
            if callable(getattr(self, value))
            and getattr(getattr(self, value), "_is_server_fn", False)
        ]

        # Svelte components expect elem_classes to be a list
        # If we don't do this, returning a new component for an
        # update will break the frontend
        if not elem_classes:
            elem_classes = []

        # This gets overridden when `select` is called
        self._selectable = False
        if not hasattr(self, "data_model"):
            self.data_model: type[GradioDataModel] | None = None

        Block.__init__(
            self,
            elem_id=elem_id,
            elem_classes=elem_classes,
            visible=visible,
            render=render,
            key=key,
        )
        if isinstance(self, StreamingInput):
            self.check_streamable()

        self.label = label
        self.info = info
        if not container:
            if show_label:
                warnings.warn("show_label has no effect when container is False.")
            show_label = False
        if show_label is None:
            show_label = True
        self.show_label = show_label
        self.container = container
        if scale is not None and scale != round(scale):
            warnings.warn(
                f"'scale' value should be an integer. Using {scale} will cause issues."
            )
        self.scale = scale
        self.min_width = min_width
        self.interactive = interactive

        # load_event is set in the Blocks.attach_load_events method
        self.load_event: None | dict[str, Any] = None
        self.load_event_to_attach: (
            None
            | tuple[
                Callable,
                list[tuple[Block, str]],
                Component | Sequence[Component] | set[Component] | None,
            ]
        ) = None
        load_fn, initial_value = self.get_load_fn_and_initial_value(value, inputs)
        initial_value = self.postprocess(initial_value)
        # Serialize the json value so that it gets stored in the
        # config as plain json, for images/audio etc. `move_files_to_cache`
        # will call model_dump
        if isinstance(initial_value, BaseModel):
            initial_value = initial_value.model_dump()
        self.value = move_files_to_cache(
            initial_value,
            self,  # type: ignore
            postprocess=True,
            keep_in_cache=True,
        )
        if client_utils.is_file_obj(self.value):
            self.keep_in_cache.add(self.value["path"])

        if callable(load_fn):
            self.attach_load_event(load_fn, every, inputs)

        self.component_class_id = self.__class__.get_component_class_id()

    TEMPLATE_DIR = DeveloperPath("./templates/")
    FRONTEND_DIR = "../../frontend/"

    def get_config(self):
        config = super().get_config()
        if self.info:
            config["info"] = self.info
        if len(self.server_fns):
            config["server_fns"] = [fn.__name__ for fn in self.server_fns]
        config.pop("render", None)
        return config

    @property
    def skip_api(self):
        return False

    @staticmethod
    def get_load_fn_and_initial_value(value, inputs=None):
        initial_value = None
        if callable(value):
            if not inputs:
                initial_value = value()
            load_fn = value
        else:
            initial_value = value
            load_fn = None
        return load_fn, initial_value

    def attach_load_event(
        self,
        callable: Callable,
        every: Timer | float | None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
    ):
        """Add an event that runs `callable`, optionally at interval specified by `every`."""
        if isinstance(inputs, Component):
            inputs = [inputs]
        changeable_events: list[tuple[Block, str]] = (
            [(i, "change") for i in inputs if hasattr(i, "change")] if inputs else []
        )
        if isinstance(every, (int, float)):
            from gradio.components import Timer

            every = Timer(every)
        if every:
            changeable_events.append((every, "tick"))
        self.load_event_to_attach = (
            callable,
            changeable_events,
            inputs,
        )

    def process_example(self, value):
        """
        Process the input data in a way that can be displayed by the examples dataset component in the front-end.
        By default, this calls the `.postprocess()` method of the component. However, if the `.postprocess()` method is
        computationally intensive, or returns a large payload, a custom implementation may be appropriate.

        For example,  the `process_example()` method of the `gr.Audio()` component only returns the name of the file, not
        the processed audio file. The `.process_example()` method of the `gr.Dataframe()` returns the head of a dataframe
        instead of the full dataframe.

        The return value of this method must be json-serializable to put in the config.
        """
        return self.postprocess(value)

    def as_example(self, value):
        """Deprecated and replaced by `process_example()`."""
        return self.process_example(value)

    def example_inputs(self) -> Any:
        """Deprecated and replaced by `example_payload()` and `example_value()`."""
        return self.example_payload()

    def example_payload(self) -> Any:
        """
        An example input data for this component, e.g. what is passed to this component's preprocess() method.
        This is used to generate the docs for the View API page for Gradio apps using this component.
        """
        raise NotImplementedError()

    def example_value(self) -> Any:
        """
        An example output data for this component, e.g. what is passed to this component's postprocess() method.
        This is used to generate an example value if this component is used as a template for a custom component.
        """
        raise NotImplementedError()

    def api_info(self) -> dict[str, Any]:
        """
        The typing information for this component as a dictionary whose values are a list of 2 strings: [Python type, language-agnostic description].
        Keys of the dictionary are: raw_input, raw_output, serialized_input, serialized_output
        """
        if self.data_model is not None:
            schema = self.data_model.model_json_schema()
            desc = schema.pop("description", None)
            schema["additional_description"] = desc
            return schema
        raise NotImplementedError(
            f"The api_info method has not been implemented for {self.get_block_name()}"
        )

    def api_info_as_input(self) -> dict[str, Any]:
        return self.api_info()

    def api_info_as_output(self) -> dict[str, Any]:
        return self.api_info()

    def flag(self, payload: Any, flag_dir: str | Path = "") -> str:
        """
        Write the component's value to a format that can be stored in a csv or jsonl format for flagging.
        """
        if self.data_model:
            payload = self.data_model.from_json(payload)
            Path(flag_dir).mkdir(exist_ok=True)
            payload = payload.copy_to_dir(flag_dir).model_dump()
        if isinstance(payload, BaseModel):
            payload = payload.model_dump()
        if not isinstance(payload, str):
            payload = json.dumps(payload)
        return payload

    def read_from_flag(self, payload: Any):
        """
        Convert the data from the csv or jsonl file into the component state.
        """
        if self.data_model:
            return self.data_model.from_json(json.loads(payload))
        return payload


class FormComponent(Component):
    def get_expected_parent(self) -> type[Form] | None:
        if getattr(self, "container", None) is False:
            return None
        return Form

    def preprocess(self, payload: Any) -> Any:
        return payload

    def postprocess(self, value):
        return value


class StreamingOutput(metaclass=abc.ABCMeta):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.streaming: bool

    @abc.abstractmethod
    async def stream_output(
        self, value, output_id: str, first_chunk: bool
    ) -> tuple[MediaStreamChunk | None, FileDataDict | dict]:
        pass

    @abc.abstractmethod
    async def combine_stream(
        self,
        stream: list[bytes],
        desired_output_format: str | None = None,
        only_file=False,
    ) -> GradioDataModel | FileData:
        """Combine all of the stream chunks into a single file.

        This is needed for downloading the stream and for caching examples.
        If `only_file` is True, only the FileData corresponding to the file should be returned (needed for downloading the stream).
        The desired_output_format optionally converts the combined file. Should only be used for cached examples.
        """
        pass


class StreamingInput(metaclass=abc.ABCMeta):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

    @abc.abstractmethod
    def check_streamable(self):
        """Used to check if streaming is supported given the input."""
        pass


def component(cls_name: str, render: bool) -> Component:
    obj = utils.component_or_layout_class(cls_name)(render=render)
    if isinstance(obj, BlockContext):
        raise ValueError(f"Invalid component: {obj.__class__}")
    if not isinstance(obj, Component):
        raise TypeError(f"Expected a Component instance, but got {obj.__class__}")
    return obj


def get_component_instance(
    comp: str | dict | Component, render: bool = False, unrender: bool = False
) -> Component:
    """
    Returns a component instance from a string, dict, or Component object.
    Parameters:
        comp: the component to instantiate. If a string, must be the name of a component, e.g. "dropdown". If a dict, must have a "name" key, e.g. {"name": "dropdown", "choices": ["a", "b"]}. If a Component object, will be returned as is.
        render: whether to render the component. If True, renders the component (if not already rendered). If False, does not do anything.
        unrender: whether to unrender the component. If True, unrenders the the component (if already rendered) -- this is useful when constructing an Interface or ChatInterface inside of a Blocks. If False, does not do anything.
    """
    if isinstance(comp, str):
        component_obj = component(comp, render=render)
    elif isinstance(comp, dict):
        name = comp.pop("name")
        component_cls = utils.component_or_layout_class(name)
        component_obj = component_cls(**comp, render=render)
        if isinstance(component_obj, BlockContext):
            raise ValueError(f"Invalid component: {name}")
    elif isinstance(comp, Component):
        component_obj = comp
    else:
        raise ValueError(
            f"Component must be provided as a `str` or `dict` or `Component` but is {comp}"
        )

    if render and not component_obj.is_rendered:
        component_obj.render()
    elif unrender and component_obj.is_rendered:
        component_obj.unrender()
    if not isinstance(component_obj, Component):
        raise TypeError(
            f"Expected a Component instance, but got {component_obj.__class__}"
        )
    return component_obj
