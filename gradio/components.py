"""Contains all of the components that can be used with Gradio Interface / Blocks.
Along with the docs for each component, you can find the names of example demos that use
each component. These demos are located in the `demo` directory."""

from __future__ import annotations

import inspect
import json
import math
import numbers
import operator
import os
import random
import tempfile
import uuid
import warnings
from copy import deepcopy
from enum import Enum
from pathlib import Path
from types import ModuleType
from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

import altair as alt
import matplotlib.figure
import numpy as np
import pandas as pd
import PIL
import PIL.ImageOps
from ffmpy import FFmpeg
from markdown_it import MarkdownIt
from mdit_py_plugins.dollarmath import dollarmath_plugin
from pandas.api.types import is_numeric_dtype

from gradio import media_data, processing_utils, utils
from gradio.blocks import Block
from gradio.context import Context
from gradio.documentation import document, set_documentation_group
from gradio.events import (
    Blurrable,
    Changeable,
    Clearable,
    Clickable,
    Editable,
    Playable,
    Streamable,
    Submittable,
    Uploadable,
)
from gradio.layouts import Column, Form, Row
from gradio.processing_utils import TempFileManager
from gradio.serializing import (
    FileSerializable,
    ImgSerializable,
    JSONSerializable,
    Serializable,
    SimpleSerializable,
)

if TYPE_CHECKING:
    from typing import TypedDict

    class DataframeData(TypedDict):
        headers: List[str]
        data: List[List[str | int | bool]]


set_documentation_group("component")


class _Keywords(Enum):
    NO_VALUE = "NO_VALUE"  # Used as a sentinel to determine if nothing is provided as a argument for `value` in `Component.update()`
    FINISHED_ITERATING = "FINISHED_ITERATING"  # Used to skip processing of a component's value (needed for generators + state)


class Component(Block):
    """
    A base class for defining the methods that all gradio components should have.
    """

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return f"{self.get_block_name()}"

    def get_config(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {
            "name": self.get_block_name(),
            **super().get_config(),
        }


class IOComponent(Component, Serializable):
    """
    A base class for defining methods that all input/output components should have.
    """

    def __init__(
        self,
        *,
        value: Any = None,
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        load_fn: Optional[Callable] = None,
        every: Optional[float] = None,
        **kwargs,
    ):
        super().__init__(elem_id=elem_id, visible=visible, **kwargs)

        self.label = label
        self.show_label = show_label
        self.interactive = interactive

        self.load_event = None
        self.load_event_to_attach = None
        load_fn, initial_value = self.get_load_fn_and_initial_value(value)
        self.value = self.postprocess(initial_value)
        if callable(load_fn):
            self.load_event = self.attach_load_event(load_fn, every)

        self.set_interpret_parameters()

    def get_config(self):
        return {
            "label": self.label,
            "show_label": self.show_label,
            "interactive": self.interactive,
            **super().get_config(),
        }

    def preprocess(self, x: Any) -> Any:
        """
        Any preprocessing needed to be performed on function input.
        """
        return x

    def set_interpret_parameters(self):
        """
        Set any parameters for interpretation.
        """
        return self

    def get_interpretation_neighbors(self, x: Any) -> Tuple[List[Any], Dict[Any], bool]:
        """
        Generates values similar to input to be used to interpret the significance of the input in the final output.
        Parameters:
            x: Input to interface
        Returns: (neighbor_values, interpret_kwargs, interpret_by_removal)
            neighbor_values: Neighboring values to input x to compute for interpretation
            interpret_kwargs: Keyword arguments to be passed to get_interpretation_scores
            interpret_by_removal: If True, returned neighbors are values where the interpreted subsection was removed. If False, returned neighbors are values where the interpreted subsection was modified to a different value.
        """
        return [], {}, True

    def get_interpretation_scores(
        self, x: Any, neighbors: List[Any], scores: List[float], **kwargs
    ) -> List[Any]:
        """
        Arrange the output values from the neighbors into interpretation scores for the interface to render.
        Parameters:
            x: Input to interface
            neighbors: Neighboring values to input x used for interpretation.
            scores: Output value corresponding to each neighbor in neighbors
        Returns:
            Arrangement of interpretation scores for interfaces to render.
        """
        pass

    def generate_sample(self) -> Any:
        """
        Returns a sample value of the input that would be accepted by the api. Used for api documentation.
        """
        pass

    def postprocess(self, y):
        """
        Any postprocessing needed to be performed on function output.
        """
        return y

    def style(
        self,
        *,
        container: Optional[bool] = None,
        **kwargs,
    ):
        """
        This method can be used to change the appearance of the component.
        Parameters:
            container: If True, will place the component in a container - providing some extra padding around the border.
        """
        put_deprecated_params_in_box = False
        if "rounded" in kwargs:
            warnings.warn(
                "'rounded' styling is no longer supported. To round adjacent components together, place them in a Column(variant='box')."
            )
            if isinstance(kwargs["rounded"], list) or isinstance(
                kwargs["rounded"], tuple
            ):
                put_deprecated_params_in_box = True
            kwargs.pop("rounded")
        if "margin" in kwargs:
            warnings.warn(
                "'margin' styling is no longer supported. To place adjacent components together without margin, place them in a Column(variant='box')."
            )
            if isinstance(kwargs["margin"], list) or isinstance(
                kwargs["margin"], tuple
            ):
                put_deprecated_params_in_box = True
            kwargs.pop("margin")
        if "border" in kwargs:
            warnings.warn(
                "'border' styling is no longer supported. To place adjacent components in a shared border, place them in a Column(variant='box')."
            )
            kwargs.pop("border")
        if container is not None:
            self._style["container"] = container
        if len(kwargs):
            for key in kwargs:
                warnings.warn(f"Unknown style parameter: {key}")
        if (
            put_deprecated_params_in_box
            and getattr(self, "parent", None).__class__ in [Row, Column]
            and self.parent.variant == "default"
        ):
            self.parent.variant = "compact"
        return self

    @staticmethod
    def add_interactive_to_config(config, interactive):
        if interactive is not None:
            config["mode"] = "dynamic" if interactive else "static"
        return config

    @staticmethod
    def get_load_fn_and_initial_value(value):
        if callable(value):
            initial_value = value()
            load_fn = value
        else:
            initial_value = value
            load_fn = None
        return load_fn, initial_value

    def attach_load_event(self, callable: Callable, every: int | None):
        """Add a load event that runs `callable`, optionally every `every` seconds."""
        if Context.root_block:
            return Context.root_block.load(
                callable,
                None,
                self,
                no_target=True,
                every=every,
            )
        else:
            self.load_event_to_attach = (callable, every)

    def as_example(self, input_data):
        """Return the input data in a way that can be displayed by the examples dataset component in the front-end."""
        return input_data


class FormComponent:
    expected_parent = Form


@document("change", "submit", "blur", "style")
class Textbox(
    Changeable, Submittable, Blurrable, IOComponent, SimpleSerializable, FormComponent
):
    """
    Creates a textarea for user to enter string input or display string output.
    Preprocessing: passes textarea value as a {str} into the function.
    Postprocessing: expects a {str} returned from function and sets textarea value to it.
    Examples-format: a {str} representing the textbox input.

    Demos: hello_world, diff_texts, sentence_builder
    Guides: creating_a_chatbot, real_time_speech_recognition
    """

    def __init__(
        self,
        value: Optional[str | Callable] = "",
        *,
        lines: int = 1,
        max_lines: int = 20,
        placeholder: Optional[str] = None,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        type: str = "text",
        **kwargs,
    ):
        """
        Parameters:
            value: default text to provide in textarea. If callable, the function will be called whenever the app loads to set the initial value of the component.
            lines: minimum number of line rows to provide in textarea.
            max_lines: maximum number of line rows to provide in textarea.
            placeholder: placeholder hint to provide behind textarea.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, will be rendered as an editable textbox; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            type: The type of textbox. One of: 'text', 'password', 'email', Default is 'text'.
        """
        if type not in ["text", "password", "email"]:
            raise ValueError('`type` must be one of "text", "password", or "email".')

        #
        self.lines = lines
        self.max_lines = max_lines if type == "text" else 1
        self.placeholder = placeholder
        self.interpret_by_tokens = True
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )
        self.cleared_value = ""
        self.test_input = value
        self.type = type

    def get_config(self):
        return {
            "lines": self.lines,
            "max_lines": self.max_lines,
            "placeholder": self.placeholder,
            "value": self.value,
            "type": self.type,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[str] = _Keywords.NO_VALUE,
        lines: Optional[int] = None,
        max_lines: Optional[int] = None,
        placeholder: Optional[str] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
        interactive: Optional[bool] = None,
        type: Optional[str] = None,
    ):
        updated_config = {
            "lines": lines,
            "max_lines": max_lines,
            "placeholder": placeholder,
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "type": type,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def generate_sample(self) -> str:
        return "Hello World"

    def preprocess(self, x: str | None) -> str | None:
        """
        Preprocesses input (converts it to a string) before passing it to the function.
        Parameters:
            x: text
        Returns:
            text
        """
        return None if x is None else str(x)

    def postprocess(self, y: str | None) -> str | None:
        """
        Postproccess the function output y by converting it to a str before passing it to the frontend.
        Parameters:
            y: function output to postprocess.
        Returns:
            text
        """
        return None if y is None else str(y)

    def set_interpret_parameters(
        self, separator: str = " ", replacement: Optional[str] = None
    ):
        """
        Calculates interpretation score of characters in input by splitting input into tokens, then using a "leave one out" method to calculate the score of each token by removing each token and measuring the delta of the output value.
        Parameters:
            separator: Separator to use to split input into tokens.
            replacement: In the "leave one out" step, the text that the token should be replaced with. If None, the token is removed altogether.
        """
        self.interpretation_separator = separator
        self.interpretation_replacement = replacement
        return self

    def tokenize(self, x: str) -> Tuple[List[str], List[str], None]:
        """
        Tokenizes an input string by dividing into "words" delimited by self.interpretation_separator
        """
        tokens = x.split(self.interpretation_separator)
        leave_one_out_strings = []
        for index in range(len(tokens)):
            leave_one_out_set = list(tokens)
            if self.interpretation_replacement is None:
                leave_one_out_set.pop(index)
            else:
                leave_one_out_set[index] = self.interpretation_replacement
            leave_one_out_strings.append(
                self.interpretation_separator.join(leave_one_out_set)
            )
        return tokens, leave_one_out_strings, None

    def get_masked_inputs(
        self, tokens: List[str], binary_mask_matrix: List[List[int]]
    ) -> List[str]:
        """
        Constructs partially-masked sentences for SHAP interpretation
        """
        masked_inputs = []
        for binary_mask_vector in binary_mask_matrix:
            masked_input = np.array(tokens)[np.array(binary_mask_vector, dtype=bool)]
            masked_inputs.append(self.interpretation_separator.join(masked_input))
        return masked_inputs

    def get_interpretation_scores(
        self, x, neighbors, scores: List[float], tokens: List[str], masks=None, **kwargs
    ) -> List[Tuple[str, float]]:
        """
        Returns:
            Each tuple set represents a set of characters and their corresponding interpretation score.
        """
        result = []
        for token, score in zip(tokens, scores):
            result.append((token, score))
            result.append((self.interpretation_separator, 0))
        return result


@document("change", "submit", "style")
class Number(
    Changeable, Submittable, Blurrable, IOComponent, SimpleSerializable, FormComponent
):
    """
    Creates a numeric field for user to enter numbers as input or display numeric output.
    Preprocessing: passes field value as a {float} or {int} into the function, depending on `precision`.
    Postprocessing: expects an {int} or {float} returned from the function and sets field value to it.
    Examples-format: a {float} or {int} representing the number's value.

    Demos: tax_calculator, titanic_survival, blocks_simple_squares
    """

    def __init__(
        self,
        value: Optional[float | Callable] = None,
        *,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        precision: Optional[int] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: default value. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, will be editable; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            precision: Precision to round input/output to. If set to 0, will round to nearest integer and covert type to int. If None, no rounding happens.
        """
        self.precision = precision
        self.interpret_by_tokens = False
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )
        self.test_input = self.value if self.value is not None else 1

    @staticmethod
    def _round_to_precision(
        num: float | int | None, precision: int | None
    ) -> float | int | None:
        """
        Round to a given precision.

        If precision is None, no rounding happens. If 0, num is converted to int.

        Parameters:
            num: Number to round.
            precision: Precision to round to.
        Returns:
            rounded number
        """
        if num is None:
            return None
        if precision is None:
            return float(num)
        elif precision == 0:
            return int(round(num, precision))
        else:
            return round(num, precision)

    def get_config(self):
        return {
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[float] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def preprocess(self, x: float | None) -> float | None:
        """
        Parameters:
            x: numeric input
        Returns:
            number representing function input
        """
        if x is None:
            return None
        return self._round_to_precision(x, self.precision)

    def postprocess(self, y: float | None) -> float | None:
        """
        Any postprocessing needed to be performed on function output.

        Parameters:
            y: numeric output
        Returns:
            number representing function output
        """
        if y is None:
            return None
        return self._round_to_precision(y, self.precision)

    def set_interpret_parameters(
        self, steps: int = 3, delta: float = 1, delta_type: str = "percent"
    ):
        """
        Calculates interpretation scores of numeric values close to the input number.
        Parameters:
            steps: Number of nearby values to measure in each direction (above and below the input number).
            delta: Size of step in each direction between nearby values.
            delta_type: "percent" if delta step between nearby values should be a calculated as a percent, or "absolute" if delta should be a constant step change.
        """
        self.interpretation_steps = steps
        self.interpretation_delta = delta
        self.interpretation_delta_type = delta_type
        return self

    def get_interpretation_neighbors(self, x: float | int) -> Tuple[List[float], Dict]:
        x = self._round_to_precision(x, self.precision)
        if self.interpretation_delta_type == "percent":
            delta = 1.0 * self.interpretation_delta * x / 100
        elif self.interpretation_delta_type == "absolute":
            delta = self.interpretation_delta
        else:
            delta = self.interpretation_delta
        if self.precision == 0 and math.floor(delta) != delta:
            raise ValueError(
                f"Delta value {delta} is not an integer and precision=0. Cannot generate valid set of neighbors. "
                "If delta_type='percent', pick a value of delta such that x * delta is an integer. "
                "If delta_type='absolute', pick a value of delta that is an integer."
            )
        # run_interpretation will preprocess the neighbors so no need to covert to int here
        negatives = (x + np.arange(-self.interpretation_steps, 0) * delta).tolist()
        positives = (x + np.arange(1, self.interpretation_steps + 1) * delta).tolist()
        return negatives + positives, {}

    def get_interpretation_scores(
        self, x: Number, neighbors: List[float], scores: List[float], **kwargs
    ) -> List[Tuple[float, float]]:
        """
        Returns:
            Each tuple set represents a numeric value near the input and its corresponding interpretation score.
        """
        interpretation = list(zip(neighbors, scores))
        interpretation.insert(int(len(interpretation) / 2), [x, None])
        return interpretation

    def generate_sample(self) -> float:
        return self._round_to_precision(1, self.precision)


@document("change", "style")
class Slider(Changeable, IOComponent, SimpleSerializable, FormComponent):
    """
    Creates a slider that ranges from `minimum` to `maximum` with a step size of `step`.
    Preprocessing: passes slider value as a {float} into the function.
    Postprocessing: expects an {int} or {float} returned from function and sets slider value to it as long as it is within range.
    Examples-format: A {float} or {int} representing the slider's value.

    Demos: sentence_builder, generate_tone, titanic_survival, interface_random_slider, blocks_random_slider
    Guides: create_your_own_friends_with_a_gan
    """

    def __init__(
        self,
        minimum: float = 0,
        maximum: float = 100,
        value: Optional[float | Callable] = None,
        *,
        step: Optional[float] = None,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        randomize: bool = False,
        **kwargs,
    ):
        """
        Parameters:
            minimum: minimum value for slider.
            maximum: maximum value for slider.
            value: default value. If callable, the function will be called whenever the app loads to set the initial value of the component. Ignored if randomized=True.
            step: increment between slider values.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, slider will be adjustable; if False, adjusting will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            randomize: If True, the value of the slider when the app loads is taken uniformly at random from the range given by the minimum and maximum.
        """
        self.minimum = minimum
        self.maximum = maximum
        if step is None:
            difference = maximum - minimum
            power = math.floor(math.log10(difference) - 2)
            step = 10**power
        self.step = step
        if randomize:
            value = self.get_random_value
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )
        self.cleared_value = self.value
        self.test_input = self.value
        self.interpret_by_tokens = False

    def get_config(self):
        return {
            "minimum": self.minimum,
            "maximum": self.maximum,
            "step": self.step,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    def get_random_value(self):
        n_steps = int((self.maximum - self.minimum) / self.step)
        step = random.randint(0, n_steps)
        value = self.minimum + step * self.step
        # Round to number of decimals in step so that UI doesn't display long decimals
        n_decimals = max(str(self.step)[::-1].find("."), 0)
        if n_decimals:
            value = round(value, n_decimals)
        return value

    @staticmethod
    def update(
        value: Optional[float] = _Keywords.NO_VALUE,
        minimum: Optional[float] = None,
        maximum: Optional[float] = None,
        step: Optional[float] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "minimum": minimum,
            "maximum": maximum,
            "step": step,
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def generate_sample(self) -> float:
        return self.maximum

    def postprocess(self, y: float | None) -> float | None:
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
            y: numeric output
        Returns:
            numeric output or minimum number if None
        """
        return self.minimum if y is None else y

    def set_interpret_parameters(self, steps: int = 8) -> "Slider":
        """
        Calculates interpretation scores of numeric values ranging between the minimum and maximum values of the slider.
        Parameters:
            steps: Number of neighboring values to measure between the minimum and maximum values of the slider range.
        """
        self.interpretation_steps = steps
        return self

    def get_interpretation_neighbors(self, x) -> Tuple[object, dict]:
        return (
            np.linspace(self.minimum, self.maximum, self.interpretation_steps).tolist(),
            {},
        )

    def get_interpretation_scores(
        self, x, neighbors, scores: List[float], **kwargs
    ) -> List[float]:
        """
        Returns:
            Each value represents the score corresponding to an evenly spaced range of inputs between the minimum and maximum slider values.
        """
        return scores

    def style(
        self,
        *,
        container: Optional[bool] = None,
    ):
        """
        This method can be used to change the appearance of the slider.
        Parameters:
            container: If True, will place the component in a container - providing some extra padding around the border.
        """
        return IOComponent.style(
            self,
            container=container,
        )


@document("change", "style")
class Checkbox(Changeable, IOComponent, SimpleSerializable, FormComponent):
    """
    Creates a checkbox that can be set to `True` or `False`.

    Preprocessing: passes the status of the checkbox as a {bool} into the function.
    Postprocessing: expects a {bool} returned from the function and, if it is True, checks the checkbox.
    Examples-format: a {bool} representing whether the box is checked.
    Demos: sentence_builder, titanic_survival
    """

    def __init__(
        self,
        value: bool | Callable = False,
        *,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: if True, checked by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, this checkbox can be checked; if False, checking will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.test_input = True
        self.interpret_by_tokens = False
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[bool] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def generate_sample(self):
        return True

    def set_interpret_parameters(self):
        """
        Calculates interpretation score of the input by comparing the output against the output when the input is the inverse boolean value of x.
        """
        return self

    def get_interpretation_neighbors(self, x):
        return [not x], {}

    def get_interpretation_scores(self, x, neighbors, scores, **kwargs):
        """
        Returns:
            The first value represents the interpretation score if the input is False, and the second if the input is True.
        """
        if x:
            return scores[0], None
        else:
            return None, scores[0]


@document("change", "style")
class CheckboxGroup(Changeable, IOComponent, SimpleSerializable, FormComponent):
    """
    Creates a set of checkboxes of which a subset can be checked.
    Preprocessing: passes the list of checked checkboxes as a {List[str]} or their indices as a {List[int]} into the function, depending on `type`.
    Postprocessing: expects a {List[str]}, each element of which becomes a checked checkbox.
    Examples-format: a {List[str]} representing the values to be checked.
    Demos: sentence_builder, titanic_survival
    """

    def __init__(
        self,
        choices: Optional[List[str]] = None,
        *,
        value: List[str] | Callable = None,
        type: str = "value",
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            choices: list of options to select from.
            value: default selected list of options. If callable, the function will be called whenever the app loads to set the initial value of the component.
            type: Type of value to be returned by component. "value" returns the list of strings of the choices selected, "index" returns the list of indicies of the choices selected.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, choices in this checkbox group will be checkable; if False, checking will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.choices = choices or []
        self.cleared_value = []
        valid_types = ["value", "index"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.test_input = self.choices
        self.interpret_by_tokens = False
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "choices": self.choices,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[List[str]] = _Keywords.NO_VALUE,
        choices: Optional[List[str]] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "choices": choices,
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def generate_sample(self):
        return self.choices

    def preprocess(self, x: List[str]) -> List[str] | List[int]:
        """
        Parameters:
            x: list of selected choices
        Returns:
            list of selected choices as strings or indices within choice list
        """
        if self.type == "value":
            return x
        elif self.type == "index":
            return [self.choices.index(choice) for choice in x]
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'value', 'index'."
            )

    def postprocess(self, y: List[str] | None) -> List[str]:
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
            y: List of selected choices
        Returns:
            List of selected choices
        """
        return [] if y is None else y

    def set_interpret_parameters(self):
        """
        Calculates interpretation score of each choice in the input by comparing the output against the outputs when each choice in the input is independently either removed or added.
        """
        return self

    def get_interpretation_neighbors(self, x):
        leave_one_out_sets = []
        for choice in self.choices:
            leave_one_out_set = list(x)
            if choice in leave_one_out_set:
                leave_one_out_set.remove(choice)
            else:
                leave_one_out_set.append(choice)
            leave_one_out_sets.append(leave_one_out_set)
        return leave_one_out_sets, {}

    def get_interpretation_scores(self, x, neighbors, scores, **kwargs):
        """
        Returns:
            For each tuple in the list, the first value represents the interpretation score if the input is False, and the second if the input is True.
        """
        final_scores = []
        for choice, score in zip(self.choices, scores):
            if choice in x:
                score_set = [score, None]
            else:
                score_set = [None, score]
            final_scores.append(score_set)
        return final_scores

    def style(
        self,
        *,
        item_container: Optional[bool] = None,
        container: Optional[bool] = None,
        **kwargs,
    ):
        """
        This method can be used to change the appearance of the CheckboxGroup.
        Parameters:
            item_container: If True, will place the items in a container.
            container: If True, will place the component in a container - providing some extra padding around the border.
        """
        if item_container is not None:
            self._style["item_container"] = item_container

        return IOComponent.style(self, container=container, **kwargs)


@document("change", "style")
class Radio(Changeable, IOComponent, SimpleSerializable, FormComponent):
    """
    Creates a set of radio buttons of which only one can be selected.
    Preprocessing: passes the value of the selected radio button as a {str} or its index as an {int} into the function, depending on `type`.
    Postprocessing: expects a {str} corresponding to the value of the radio button to be selected.
    Examples-format: a {str} representing the radio option to select.

    Demos: sentence_builder, titanic_survival, blocks_essay
    """

    def __init__(
        self,
        choices: Optional[List[str]] = None,
        *,
        value: Optional[str | Callable] = None,
        type: str = "value",
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            choices: list of options to select from.
            value: the button selected by default. If None, no button is selected by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            type: Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, choices in this radio group will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.choices = choices or []
        valid_types = ["value", "index"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.test_input = self.choices[0] if len(self.choices) else None
        self.interpret_by_tokens = False
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )
        self.cleared_value = self.value

    def get_config(self):
        return {
            "choices": self.choices,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        choices: Optional[List[str]] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "choices": choices,
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def generate_sample(self):
        return self.choices[0]

    def preprocess(self, x: str) -> str | int:
        """
        Parameters:
            x: selected choice
        Returns:
            selected choice as string or index within choice list
        """
        if self.type == "value":
            return x
        elif self.type == "index":
            if x is None:
                return None
            else:
                return self.choices.index(x)
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'value', 'index'."
            )

    def set_interpret_parameters(self):
        """
        Calculates interpretation score of each choice by comparing the output against each of the outputs when alternative choices are selected.
        """
        return self

    def get_interpretation_neighbors(self, x):
        choices = list(self.choices)
        choices.remove(x)
        return choices, {}

    def get_interpretation_scores(self, x, neighbors, scores, **kwargs) -> List:
        """
        Returns:
            Each value represents the interpretation score corresponding to each choice.
        """
        scores.insert(self.choices.index(x), None)
        return scores

    def style(
        self,
        *,
        item_container: Optional[bool] = None,
        container: Optional[bool] = None,
        **kwargs,
    ):
        """
        This method can be used to change the appearance of the radio component.
        Parameters:
            item_container: If True, will place items in a container.
            container: If True, will place the component in a container - providing some extra padding around the border.
        """
        if item_container is not None:
            self._style["item_container"] = item_container

        return IOComponent.style(self, container=container, **kwargs)


@document("change", "style")
class Dropdown(Radio):
    """
    Creates a dropdown of which only one entry can be selected.
    Preprocessing: passes the value of the selected dropdown entry as a {str} or its index as an {int} into the function, depending on `type`.
    Postprocessing: expects a {str} corresponding to the value of the dropdown entry to be selected.
    Examples-format: a {str} representing the drop down value to select.
    Demos: sentence_builder, titanic_survival
    """

    def __init__(
        self,
        choices: Optional[List[str]] = None,
        *,
        value: Optional[str | Callable] = None,
        type: str = "value",
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            choices: list of options to select from.
            value: default value selected in dropdown. If None, no value is selected by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            type: Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, choices in this dropdown will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        Radio.__init__(
            self,
            value=value,
            choices=choices,
            type=type,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def style(self, *, container: Optional[bool] = None, **kwargs):
        """
        This method can be used to change the appearance of the Dropdown.
        Parameters:
            container: If True, will place the component in a container - providing some extra padding around the border.
        """
        return IOComponent.style(self, container=container, **kwargs)


@document("edit", "clear", "change", "stream", "change", "style")
class Image(
    Editable,
    Clearable,
    Changeable,
    Streamable,
    Uploadable,
    IOComponent,
    ImgSerializable,
):
    """
    Creates an image component that can be used to upload/draw images (as an input) or display images (as an output).
    Preprocessing: passes the uploaded image as a {numpy.array}, {PIL.Image} or {str} filepath depending on `type` -- unless `tool` is `sketch` AND source is one of `upload` or `webcam`. In these cases, a {dict} with keys `image` and `mask` is passed, and the format of the corresponding values depends on `type`.
    Postprocessing: expects a {numpy.array}, {PIL.Image} or {str} or {pathlib.Path} filepath to an image and displays the image.
    Examples-format: a {str} filepath to a local file that contains the image.
    Demos: image_mod, image_mod_default_image
    Guides: Gradio_and_ONNX_on_Hugging_Face, image_classification_in_pytorch, image_classification_in_tensorflow, image_classification_with_vision_transformers, building_a_pictionary_app, create_your_own_friends_with_a_gan
    """

    def __init__(
        self,
        value: Optional[str | PIL.Image | np.narray] = None,
        *,
        shape: Tuple[int, int] = None,
        image_mode: str = "RGB",
        invert_colors: bool = False,
        source: str = "upload",
        tool: str = None,
        type: str = "numpy",
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        streaming: bool = False,
        elem_id: Optional[str] = None,
        mirror_webcam: bool = True,
        **kwargs,
    ):
        """
        Parameters:
            value: A PIL Image, numpy array, path or URL for the default value that Image component is going to take. If callable, the function will be called whenever the app loads to set the initial value of the component.
            shape: (width, height) shape to crop and resize image to; if None, matches input image size. Pass None for either width or height to only crop and resize the other.
            image_mode: "RGB" if color, or "L" if black and white.
            invert_colors: whether to invert the image as a preprocessing step.
            source: Source of image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "canvas" defaults to a white image that can be edited and drawn upon with tools.
            tool: Tools used for editing. "editor" allows a full screen editor (and is the default if source is "upload" or "webcam"), "select" provides a cropping and zoom tool, "sketch" allows you to create a binary sketch (and is the default if source="canvas"), and "color-sketch" allows you to created a sketch in different colors. "color-sketch" can be used with source="upload" or "webcam" to allow sketching on an image. "sketch" can also be used with "upload" or "webcam" to create a mask over an image and in that case both the image and mask are passed into the function as a dictionary with keys "image" and "mask" respectively.
            type: The format the image is converted to before being passed into the prediction function. "numpy" converts the image to a numpy array with shape (width, height, 3) and values from 0 to 255, "pil" converts the image to a PIL image object, "filepath" passes a str path to a temporary file containing the image.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, will allow users to upload and edit an image; if False, can only be used to display images. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            streaming: If True when used in a `live` interface, will automatically stream webcam feed. Only valid is source is 'webcam'.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            mirror_webcam: If True webcam will be mirrored. Default is True.
        """
        self.mirror_webcam = mirror_webcam
        valid_types = ["numpy", "pil", "filepath"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.shape = shape
        self.image_mode = image_mode
        valid_sources = ["upload", "webcam", "canvas"]
        if source not in valid_sources:
            raise ValueError(
                f"Invalid value for parameter `source`: {source}. Please choose from one of: {valid_sources}"
            )
        self.source = source
        if tool is None:
            self.tool = "sketch" if source == "canvas" else "editor"
        else:
            self.tool = tool
        self.invert_colors = invert_colors
        self.test_input = deepcopy(media_data.BASE64_IMAGE)
        self.interpret_by_tokens = True
        self.streaming = streaming
        if streaming and source != "webcam":
            raise ValueError("Image streaming only available if source is 'webcam'.")

        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "image_mode": self.image_mode,
            "shape": self.shape,
            "source": self.source,
            "tool": self.tool,
            "value": self.value,
            "streaming": self.streaming,
            "mirror_webcam": self.mirror_webcam,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def _format_image(
        self, im: Optional[PIL.Image]
    ) -> np.array | PIL.Image | str | None:
        """Helper method to format an image based on self.type"""
        fmt = im.format
        if im is None:
            return im
        if self.type == "pil":
            return im
        elif self.type == "numpy":
            return np.array(im)
        elif self.type == "filepath":
            file_obj = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=("." + fmt.lower() if fmt is not None else ".png"),
            )
            im.save(file_obj.name)
            return file_obj.name
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'numpy', 'pil', 'filepath'."
            )

    def generate_sample(self):
        return deepcopy(media_data.BASE64_IMAGE)

    def preprocess(self, x: str | Dict) -> np.array | PIL.Image | str | None:
        """
        Parameters:
            x: base64 url data, or (if tool == "sketch") a dict of image and mask base64 url data
        Returns:
            image in requested format, or (if tool == "sketch") a dict of image and mask in requested format
        """
        if x is None:
            return x
        if self.tool == "sketch" and self.source in ["upload", "webcam"]:
            x, mask = x["image"], x["mask"]
        im = processing_utils.decode_base64_to_image(x)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            im = im.convert(self.image_mode)
        if self.shape is not None:
            im = processing_utils.resize_and_crop(im, self.shape)
        if self.invert_colors:
            im = PIL.ImageOps.invert(im)
        if (
            self.source == "webcam"
            and self.mirror_webcam is True
            and self.tool != "color-sketch"
        ):
            im = PIL.ImageOps.mirror(im)

        if self.tool == "sketch" and self.source in ["upload", "webcam"]:
            mask_im = processing_utils.decode_base64_to_image(mask)
            return {
                "image": self._format_image(im),
                "mask": self._format_image(mask_im),
            }

        return self._format_image(im)

    def postprocess(self, y: np.ndarray | PIL.Image | str | Path) -> str:
        """
        Parameters:
            y: image as a numpy array, PIL Image, string/Path filepath, or string URL
        Returns:
            base64 url data
        """
        if y is None:
            return None
        if isinstance(y, np.ndarray):
            return processing_utils.encode_array_to_base64(y)
        elif isinstance(y, PIL.Image.Image):
            return processing_utils.encode_pil_to_base64(y)
        elif isinstance(y, (str, Path)):
            return processing_utils.encode_url_or_file_to_base64(y)
        else:
            raise ValueError("Cannot process this value as an Image")

    def set_interpret_parameters(self, segments: int = 16):
        """
        Calculates interpretation score of image subsections by splitting the image into subsections, then using a "leave one out" method to calculate the score of each subsection by whiting out the subsection and measuring the delta of the output value.
        Parameters:
            segments: Number of interpretation segments to split image into.
        """
        self.interpretation_segments = segments
        return self

    def _segment_by_slic(self, x):
        """
        Helper method that segments an image into superpixels using slic.
        Parameters:
            x: base64 representation of an image
        """
        x = processing_utils.decode_base64_to_image(x)
        if self.shape is not None:
            x = processing_utils.resize_and_crop(x, self.shape)
        resized_and_cropped_image = np.array(x)
        try:
            from skimage.segmentation import slic
        except (ImportError, ModuleNotFoundError):
            raise ValueError(
                "Error: running this interpretation for images requires scikit-image, please install it first."
            )
        try:
            segments_slic = slic(
                resized_and_cropped_image,
                self.interpretation_segments,
                compactness=10,
                sigma=1,
                start_label=1,
            )
        except TypeError:  # For skimage 0.16 and older
            segments_slic = slic(
                resized_and_cropped_image,
                self.interpretation_segments,
                compactness=10,
                sigma=1,
            )
        return segments_slic, resized_and_cropped_image

    def tokenize(self, x):
        """
        Segments image into tokens, masks, and leave-one-out-tokens
        Parameters:
            x: base64 representation of an image
        Returns:
            tokens: list of tokens, used by the get_masked_input() method
            leave_one_out_tokens: list of left-out tokens, used by the get_interpretation_neighbors() method
            masks: list of masks, used by the get_interpretation_neighbors() method
        """
        segments_slic, resized_and_cropped_image = self._segment_by_slic(x)
        tokens, masks, leave_one_out_tokens = [], [], []
        replace_color = np.mean(resized_and_cropped_image, axis=(0, 1))
        for (i, segment_value) in enumerate(np.unique(segments_slic)):
            mask = segments_slic == segment_value
            image_screen = np.copy(resized_and_cropped_image)
            image_screen[segments_slic == segment_value] = replace_color
            leave_one_out_tokens.append(
                processing_utils.encode_array_to_base64(image_screen)
            )
            token = np.copy(resized_and_cropped_image)
            token[segments_slic != segment_value] = 0
            tokens.append(token)
            masks.append(mask)
        return tokens, leave_one_out_tokens, masks

    def get_masked_inputs(self, tokens, binary_mask_matrix):
        masked_inputs = []
        for binary_mask_vector in binary_mask_matrix:
            masked_input = np.zeros_like(tokens[0], dtype=int)
            for token, b in zip(tokens, binary_mask_vector):
                masked_input = masked_input + token * int(b)
            masked_inputs.append(processing_utils.encode_array_to_base64(masked_input))
        return masked_inputs

    def get_interpretation_scores(
        self, x, neighbors, scores, masks, tokens=None, **kwargs
    ) -> List[List[float]]:
        """
        Returns:
            A 2D array representing the interpretation score of each pixel of the image.
        """
        x = processing_utils.decode_base64_to_image(x)
        if self.shape is not None:
            x = processing_utils.resize_and_crop(x, self.shape)
        x = np.array(x)
        output_scores = np.zeros((x.shape[0], x.shape[1]))

        for score, mask in zip(scores, masks):
            output_scores += score * mask

        max_val, min_val = np.max(output_scores), np.min(output_scores)
        if max_val > 0:
            output_scores = (output_scores - min_val) / (max_val - min_val)
        return output_scores.tolist()

    def style(
        self, *, height: Optional[int] = None, width: Optional[int] = None, **kwargs
    ):
        """
        This method can be used to change the appearance of the Image component.
        Parameters:
            height: Height of the image.
            width: Width of the image.
        """
        self._style["height"] = height
        self._style["width"] = width
        return IOComponent.style(
            self,
            **kwargs,
        )

    def stream(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        _js: Optional[str] = None,
        api_name: Optional[str] = None,
        preprocess: bool = True,
        postprocess: bool = True,
    ):
        """
        This event is triggered when the user streams the component (e.g. a live webcam
        component)
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        """
        # js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if self.source != "webcam":
            raise ValueError("Image streaming only available if source is 'webcam'.")
        Streamable.stream(
            self,
            fn,
            inputs,
            outputs,
            _js=_js,
            api_name=api_name,
            preprocess=preprocess,
            postprocess=postprocess,
        )

    def as_example(self, input_data: str | None) -> str:
        return os.path.abspath(input_data)


@document("change", "clear", "play", "pause", "stop", "style")
class Video(
    Changeable,
    Clearable,
    Playable,
    Uploadable,
    IOComponent,
    FileSerializable,
    TempFileManager,
):
    """
    Creates a video component that can be used to upload/record videos (as an input) or display videos (as an output).
    For the video to be playable in the browser it must have a compatible container and codec combination. Allowed
    combinations are .mp4 with h264 codec, .ogg with theora codec, and .webm with vp9 codec. If the component detects
    that the output video would not be playable in the browser it will attempt to convert it to a playable mp4 video.
    If the conversion fails, the original video is returned.
    Preprocessing: passes the uploaded video as a {str} filepath or URL whose extension can be modified by `format`.
    Postprocessing: expects a {str} filepath to a video which is displayed.
    Examples-format: a {str} filepath to a local file that contains the video.
    Demos: video_identity
    """

    def __init__(
        self,
        value: Optional[str | Callable] = None,
        *,
        format: Optional[str] = None,
        source: str = "upload",
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        mirror_webcam: bool = True,
        **kwargs,
    ):
        """
        Parameters:
            value: A path or URL for the default value that Video component is going to take. If callable, the function will be called whenever the app loads to set the initial value of the component.
            format: Format of video format to be returned by component, such as 'avi' or 'mp4'. Use 'mp4' to ensure browser playability. If set to None, video will keep uploaded format.
            source: Source of video. "upload" creates a box where user can drop an video file, "webcam" allows user to record a video from their webcam.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, will allow users to upload a video; if False, can only be used to display videos. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            mirror_webcam: If True webcma will be mirrored. Default is True.
        """
        self.format = format
        valid_sources = ["upload", "webcam"]
        if source not in valid_sources:
            raise ValueError(
                f"Invalid value for parameter `source`: {source}. Please choose from one of: {valid_sources}"
            )
        self.source = source
        self.mirror_webcam = mirror_webcam
        TempFileManager.__init__(self)
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "source": self.source,
            "value": self.value,
            "mirror_webcam": self.mirror_webcam,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        source: Optional[str] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "source": source,
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def preprocess(self, x: Dict[str, str] | None) -> str | None:
        """
        Parameters:
            x: a dictionary with the following keys: 'name' (containing the file path to a video), 'data' (with either the file URL or base64 representation of the video), and 'is_file` (True if `data` contains the file URL).
        Returns:
            a string file path to the preprocessed video
        """
        if x is None:
            return x

        file_name, file_data, is_file = (
            x["name"],
            x["data"],
            x.get("is_file", False),
        )
        if is_file:
            file = self.make_temp_copy_if_needed(file_name)
            file_name = Path(file)
        else:
            file = processing_utils.decode_base64_to_file(
                file_data, file_path=file_name
            )
            file_name = Path(file.name)

        uploaded_format = file_name.suffix.replace(".", "")
        modify_format = self.format is not None and uploaded_format != self.format
        flip = self.source == "webcam" and self.mirror_webcam
        if modify_format or flip:
            format = f".{self.format if modify_format else uploaded_format}"
            output_options = ["-vf", "hflip", "-c:a", "copy"] if flip else None
            flip_suffix = "_flip" if flip else ""
            output_file_name = str(
                file_name.with_name(f"{file_name.stem}{flip_suffix}{format}")
            )
            if os.path.exists(output_file_name):
                return output_file_name
            ff = FFmpeg(
                inputs={str(file_name): None},
                outputs={output_file_name: output_options},
            )
            ff.run()
            return output_file_name
        else:
            return str(file_name)

    def generate_sample(self):
        """Generates a random video for testing the API."""
        return deepcopy(media_data.BASE64_VIDEO)

    def postprocess(self, y: str | None) -> Dict[str, str] | None:
        """
        Processes a video to ensure that it is in the correct format before
        returning it to the front end.
        Parameters:
            y: a path or URL to the video file
        Returns:
            a dictionary with the following keys: 'name' (containing the file path
            to a temporary copy of the video), 'data' (None), and 'is_file` (True).
        """
        if y is None:
            return None

        returned_format = y.split(".")[-1].lower()

        if self.format is None or returned_format == self.format:
            conversion_needed = False
        else:
            conversion_needed = True

        # For cases where the video is a URL and does not need to be converted to another format, we can just return the URL
        if utils.validate_url(y) and not (conversion_needed):
            return {"name": y, "data": None, "is_file": True}

        # For cases where the video needs to be converted to another format
        if utils.validate_url(y):
            y = self.download_temp_copy_if_needed(y)
        if (
            processing_utils.ffmpeg_installed()
            and not processing_utils.video_is_playable(y)
        ):
            warnings.warn(
                "Video does not have browser-compatible container or codec. Converting to mp4"
            )
            y = processing_utils.convert_video_to_playable_mp4(y)
        if self.format is not None and returned_format != self.format:
            output_file_name = y[0 : y.rindex(".") + 1] + self.format
            ff = FFmpeg(inputs={y: None}, outputs={output_file_name: None})
            ff.run()
            y = output_file_name

        y = self.make_temp_copy_if_needed(y)
        return {"name": y, "data": None, "is_file": True}

    def style(
        self, *, height: Optional[int] = None, width: Optional[int] = None, **kwargs
    ):
        """
        This method can be used to change the appearance of the video component.
        Parameters:
            height: Height of the video.
            width: Width of the video.
        """
        self._style["height"] = height
        self._style["width"] = width
        return IOComponent.style(
            self,
            **kwargs,
        )


@document("change", "clear", "play", "pause", "stop", "stream", "style")
class Audio(
    Changeable,
    Clearable,
    Playable,
    Streamable,
    Uploadable,
    IOComponent,
    FileSerializable,
    TempFileManager,
):
    """
    Creates an audio component that can be used to upload/record audio (as an input) or display audio (as an output).
    Preprocessing: passes the uploaded audio as a {Tuple(int, numpy.array)} corresponding to (sample rate, data) or as a {str} filepath, depending on `type`
    Postprocessing: expects a {Tuple(int, numpy.array)} corresponding to (sample rate, data) or as a {str} filepath or URL to an audio file, which gets displayed
    Examples-format: a {str} filepath to a local file that contains audio.
    Demos: main_note, generate_tone, reverse_audio
    Guides: real_time_speech_recognition
    """

    def __init__(
        self,
        value: Optional[str | Tuple[int, np.array] | Callable] = None,
        *,
        source: str = "upload",
        type: str = "numpy",
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        streaming: bool = False,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: A path, URL, or [sample_rate, numpy array] tuple for the default value that Audio component is going to take. If callable, the function will be called whenever the app loads to set the initial value of the component.
            source: Source of audio. "upload" creates a box where user can drop an audio file, "microphone" creates a microphone input.
            type: The format the audio file is converted to before being passed into the prediction function. "numpy" converts the audio to a tuple consisting of: (int sample rate, numpy.array for the data), "filepath" passes a str path to a temporary file containing the audio.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, will allow users to upload and edit a audio file; if False, can only be used to play audio. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            streaming: If set to True when used in a `live` interface, will automatically stream webcam feed. Only valid is source is 'microphone'.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        valid_sources = ["upload", "microphone"]
        if source not in valid_sources:
            raise ValueError(
                f"Invalid value for parameter `source`: {source}. Please choose from one of: {valid_sources}"
            )
        self.source = source
        valid_types = ["numpy", "filepath"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.test_input = deepcopy(media_data.BASE64_AUDIO)
        self.interpret_by_tokens = True
        self.streaming = streaming
        if streaming and source != "microphone":
            raise ValueError(
                "Audio streaming only available if source is 'microphone'."
            )
        TempFileManager.__init__(self)
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "source": self.source,
            "value": self.value,
            "streaming": self.streaming,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        source: Optional[str] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "source": source,
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def preprocess(self, x: Dict[str, str] | None) -> Tuple[int, np.array] | str | None:
        """
        Parameters:
            x: dictionary with keys "name", "data", "is_file", "crop_min", "crop_max".
        Returns:
            audio in requested format
        """
        if x is None:
            return x
        file_name, file_data, is_file = (
            x["name"],
            x["data"],
            x.get("is_file", False),
        )
        crop_min, crop_max = x.get("crop_min", 0), x.get("crop_max", 100)
        if is_file:
            if utils.validate_url(file_name):
                temp_file_path = self.download_temp_copy_if_needed(file_name)
            else:
                temp_file_path = self.make_temp_copy_if_needed(file_name)
        else:
            temp_file_obj = processing_utils.decode_base64_to_file(
                file_data, file_path=file_name
            )
            temp_file_path = temp_file_obj.name

        sample_rate, data = processing_utils.audio_from_file(
            temp_file_path, crop_min=crop_min, crop_max=crop_max
        )

        if self.type == "numpy":
            return sample_rate, data
        elif self.type == "filepath":
            processing_utils.audio_to_file(sample_rate, data, temp_file_path)
            return temp_file_path
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'numpy', 'filepath'."
            )

    def set_interpret_parameters(self, segments: int = 8):
        """
        Calculates interpretation score of audio subsections by splitting the audio into subsections, then using a "leave one out" method to calculate the score of each subsection by removing the subsection and measuring the delta of the output value.
        Parameters:
            segments: Number of interpretation segments to split audio into.
        """
        self.interpretation_segments = segments
        return self

    def tokenize(self, x):
        if x.get("is_file"):
            sample_rate, data = processing_utils.audio_from_file(x["name"])
        else:
            file_obj = processing_utils.decode_base64_to_file(x["data"])
            sample_rate, data = processing_utils.audio_from_file(file_obj.name)
        leave_one_out_sets = []
        tokens = []
        masks = []
        duration = data.shape[0]
        boundaries = np.linspace(0, duration, self.interpretation_segments + 1).tolist()
        boundaries = [round(boundary) for boundary in boundaries]
        for index in range(len(boundaries) - 1):
            start, stop = boundaries[index], boundaries[index + 1]
            masks.append((start, stop))

            # Handle the leave one outs
            leave_one_out_data = np.copy(data)
            leave_one_out_data[start:stop] = 0
            file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            processing_utils.audio_to_file(sample_rate, leave_one_out_data, file.name)
            out_data = processing_utils.encode_file_to_base64(file.name)
            leave_one_out_sets.append(out_data)
            file.close()
            os.unlink(file.name)

            # Handle the tokens
            token = np.copy(data)
            token[0:start] = 0
            token[stop:] = 0
            file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            processing_utils.audio_to_file(sample_rate, token, file.name)
            token_data = processing_utils.encode_file_to_base64(file.name)
            file.close()
            os.unlink(file.name)

            tokens.append(token_data)
        tokens = [{"name": "token.wav", "data": token} for token in tokens]
        leave_one_out_sets = [
            {"name": "loo.wav", "data": loo_set} for loo_set in leave_one_out_sets
        ]
        return tokens, leave_one_out_sets, masks

    def get_masked_inputs(self, tokens, binary_mask_matrix):
        # create a "zero input" vector and get sample rate
        x = tokens[0]["data"]
        file_obj = processing_utils.decode_base64_to_file(x)
        sample_rate, data = processing_utils.audio_from_file(file_obj.name)
        zero_input = np.zeros_like(data, dtype="int16")
        # decode all of the tokens
        token_data = []
        for token in tokens:
            file_obj = processing_utils.decode_base64_to_file(token["data"])
            _, data = processing_utils.audio_from_file(file_obj.name)
            token_data.append(data)
        # construct the masked version
        masked_inputs = []
        for binary_mask_vector in binary_mask_matrix:
            masked_input = np.copy(zero_input)
            for t, b in zip(token_data, binary_mask_vector):
                masked_input = masked_input + t * int(b)
            file = tempfile.NamedTemporaryFile(delete=False)
            processing_utils.audio_to_file(sample_rate, masked_input, file.name)
            masked_data = processing_utils.encode_file_to_base64(file.name)
            file.close()
            os.unlink(file.name)
            masked_inputs.append(masked_data)
        return masked_inputs

    def get_interpretation_scores(
        self, x, neighbors, scores, masks=None, tokens=None
    ) -> List[float]:
        """
        Returns:
            Each value represents the interpretation score corresponding to an evenly spaced subsection of audio.
        """
        return list(scores)

    def generate_sample(self):
        return deepcopy(media_data.BASE64_AUDIO)

    def postprocess(self, y: Tuple[int, np.array] | str | None) -> str | None:
        """
        Parameters:
            y: audio data in either of the following formats: a tuple of (sample_rate, data), or a string filepath or URL to an audio file, or None.
        Returns:
            base64 url data
        """
        if y is None:
            return None

        if utils.validate_url(y):
            return {"name": y, "data": None, "is_file": True}

        if isinstance(y, tuple):
            sample_rate, data = y
            file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            processing_utils.audio_to_file(sample_rate, data, file.name)
            file_path = file.name
            self.temp_files.add(file_path)
        else:
            file_path = self.make_temp_copy_if_needed(y)

        return {"name": file_path, "data": None, "is_file": True}

    def stream(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        _js: Optional[str] = None,
        api_name: Optional[str] = None,
        preprocess: bool = True,
        postprocess: bool = True,
    ):
        """
        This event is triggered when the user streams the component (e.g. a live webcam
        component)
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        """
        #             _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if self.source != "microphone":
            raise ValueError(
                "Audio streaming only available if source is 'microphone'."
            )
        Streamable.stream(
            self,
            fn,
            inputs,
            outputs,
            _js=_js,
            api_name=api_name,
            preprocess=preprocess,
            postprocess=postprocess,
        )

    def style(
        self,
        **kwargs,
    ):
        """
        This method can be used to change the appearance of the audio component.
        """
        return IOComponent.style(
            self,
            **kwargs,
        )

    def as_example(self, input_data: str | None) -> str:
        return Path(input_data).name if input_data else ""


@document("change", "clear", "style")
class File(
    Changeable, Clearable, Uploadable, IOComponent, FileSerializable, TempFileManager
):
    """
    Creates a file component that allows uploading generic file (when used as an input) and or displaying generic files (output).
    Preprocessing: passes the uploaded file as a {file-object} or {List[file-object]} depending on `file_count` (or a {bytes}/{List{bytes}} depending on `type`)
    Postprocessing: expects function to return a {str} path to a file, or {List[str]} consisting of paths to files.
    Examples-format: a {str} path to a local file that populates the component.
    Demos: zip_to_json, zip_files
    """

    def __init__(
        self,
        value: Optional[str | List[str] | Callable] = None,
        *,
        file_count: str = "single",
        file_types: List[str] = None,
        type: str = "file",
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default file to display, given as str file path. If callable, the function will be called whenever the app loads to set the initial value of the component.
            file_count: if single, allows user to upload one file. If "multiple", user uploads multiple files. If "directory", user uploads all files in selected directory. Return type will be list for each file in case of "multiple" or "directory".
            file_types: List of type of files to be uploaded. "file" allows any file to be uploaded, "image" allows only image files to be uploaded, "audio" allows only audio files to be uploaded, "video" allows only video files to be uploaded, "text" allows only text files to be uploaded.
            type: Type of value to be returned by component. "file" returns a temporary file object whose path can be retrieved by file_obj.name and original filename can be retrieved with file_obj.orig_name, "binary" returns an bytes object.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, will allow users to upload a file; if False, can only be used to display files. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.file_count = file_count
        self.file_types = file_types
        valid_types = [
            "file",
            "binary",
            "bytes",
        ]  # "bytes" is included for backwards compatibility
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        if type == "bytes":
            warnings.warn(
                "The `bytes` type is deprecated and may not work as expected. Please use `binary` instead."
            )
        self.type = type
        self.test_input = None
        TempFileManager.__init__(self)
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "file_count": self.file_count,
            "file_types": self.file_types,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def preprocess(
        self, x: List[Dict[str, str]] | None
    ) -> tempfile._TemporaryFileWrapper | List[
        tempfile._TemporaryFileWrapper
    ] | bytes | List[bytes]:
        """
        Parameters:
            x: List of JSON objects with filename as 'name' property and base64 data as 'data' property
        Returns:
            File objects in requested format
        """
        if x is None:
            return None

        def process_single_file(f):
            file_name, data, is_file = (
                f["name"],
                f["data"],
                f.get("is_file", False),
            )
            if self.type == "file":
                if is_file:
                    temp_file_path = self.make_temp_copy_if_needed(file_name)
                    file = tempfile.NamedTemporaryFile(delete=False)
                    file.name = temp_file_path
                    file.orig_name = file_name
                else:
                    file = processing_utils.decode_base64_to_file(
                        data, file_path=file_name
                    )
                    file.orig_name = file_name
                return file
            elif (
                self.type == "binary" or self.type == "bytes"
            ):  # "bytes" is included for backwards compatibility
                if is_file:
                    with open(file_name, "rb") as file_data:
                        return file_data.read()
                return processing_utils.decode_base64_to_binary(data)[0]
            else:
                raise ValueError(
                    "Unknown type: "
                    + str(self.type)
                    + ". Please choose from: 'file', 'bytes'."
                )

        if self.file_count == "single":
            if isinstance(x, list):
                return process_single_file(x[0])
            else:
                return process_single_file(x)
        else:
            if isinstance(x, list):
                return [process_single_file(f) for f in x]
            else:
                return process_single_file(x)

    def generate_sample(self):
        return deepcopy(media_data.BASE64_FILE)

    def postprocess(
        self, y: str | List[str]
    ) -> Dict[str | Any] | List[Dict[str | Any]]:
        """
        Parameters:
            y: file path
        Returns:
            JSON object with key 'name' for filename, 'data' for base64 url, and 'size' for filesize in bytes
        """
        if y is None:
            return None
        if isinstance(y, list):
            return [
                {
                    "orig_name": os.path.basename(file),
                    "name": self.make_temp_copy_if_needed(file),
                    "size": os.path.getsize(file),
                    "data": None,
                    "is_file": True,
                }
                for file in y
            ]
        else:
            return {
                "orig_name": os.path.basename(y),
                "name": self.make_temp_copy_if_needed(y),
                "size": os.path.getsize(y),
                "data": None,
                "is_file": True,
            }

    def serialize(self, x: str, load_dir: str = "", called_directly: bool = False):
        serialized = FileSerializable.serialize(self, x, load_dir, called_directly)
        serialized["size"] = os.path.getsize(serialized["name"])
        return serialized

    def style(
        self,
        **kwargs,
    ):
        """
        This method can be used to change the appearance of the file component.
        """
        return IOComponent.style(
            self,
            **kwargs,
        )

    def as_example(self, input_data: str | List | None) -> str | List[str]:
        if input_data is None:
            return ""
        elif isinstance(input_data, list):
            return [Path(file).name for file in input_data]
        else:
            return Path(input_data).name


@document("change", "style")
class Dataframe(Changeable, IOComponent, JSONSerializable):
    """
    Accepts or displays 2D input through a spreadsheet-like component for dataframes.
    Preprocessing: passes the uploaded spreadsheet data as a {pandas.DataFrame}, {numpy.array}, {List[List]}, or {List} depending on `type`
    Postprocessing: expects a {pandas.DataFrame}, {numpy.array}, {List[List]}, {List}, a {Dict} with keys `data` (and optionally `headers`), or {str} path to a csv, which is rendered in the spreadsheet.
    Examples-format: a {str} filepath to a csv with data, a pandas dataframe, or a list of lists (excluding headers) where each sublist is a row of data.
    Demos: filter_records, matrix_transpose, tax_calculator
    """

    markdown_parser = None

    def __init__(
        self,
        value: Optional[List[List[Any]] | Callable] = None,
        *,
        headers: Optional[List[str]] = None,
        row_count: int | Tuple[int, str] = (1, "dynamic"),
        col_count: Optional[int | Tuple[int, str]] = None,
        datatype: str | List[str] = "str",
        type: str = "pandas",
        max_rows: Optional[int] = 20,
        max_cols: Optional[int] = None,
        overflow_row_behaviour: str = "paginate",
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        wrap: bool = False,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value as a 2-dimensional list of values. If callable, the function will be called whenever the app loads to set the initial value of the component.
            headers: List of str header names. If None, no headers are shown.
            row_count: Limit number of rows for input and decide whether user can create new rows. The first element of the tuple is an `int`, the row count; the second should be 'fixed' or 'dynamic', the new row behaviour. If an `int` is passed the rows default to 'dynamic'
            col_count: Limit number of columns for input and decide whether user can create new columns. The first element of the tuple is an `int`, the number of columns; the second should be 'fixed' or 'dynamic', the new column behaviour. If an `int` is passed the columns default to 'dynamic'
            datatype: Datatype of values in sheet. Can be provided per column as a list of strings, or for the entire sheet as a single string. Valid datatypes are "str", "number", "bool", "date", and "markdown".
            type: Type of value to be returned by component. "pandas" for pandas dataframe, "numpy" for numpy array, or "array" for a Python array.
            label: component name in interface.
            max_rows: Maximum number of rows to display at once. Set to None for infinite.
            max_cols: Maximum number of columns to display at once. Set to None for infinite.
            overflow_row_behaviour: If set to "paginate", will create pages for overflow rows. If set to "show_ends", will show initial and final rows and truncate middle rows.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, will allow users to edit the dataframe; if False, can only be used to display data. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            wrap: if True text in table cells will wrap when appropriate, if False the table will scroll horiztonally. Defaults to False.
        """

        self.wrap = wrap
        self.row_count = self.__process_counts(row_count)
        self.col_count = self.__process_counts(
            col_count, len(headers) if headers else 3
        )

        self.__validate_headers(headers, self.col_count[0])

        self.headers = (
            headers if headers is not None else list(range(1, self.col_count[0] + 1))
        )
        self.datatype = (
            datatype if isinstance(datatype, list) else [datatype] * self.col_count[0]
        )
        valid_types = ["pandas", "numpy", "array"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        values = {
            "str": "",
            "number": 0,
            "bool": False,
            "date": "01/01/1970",
            "markdown": "",
            "html": "",
        }
        column_dtypes = (
            [datatype] * self.col_count[0] if isinstance(datatype, str) else datatype
        )
        self.test_input = [
            [values[c] for c in column_dtypes] for _ in range(self.row_count[0])
        ]

        self.max_rows = max_rows
        self.max_cols = max_cols
        self.overflow_row_behaviour = overflow_row_behaviour
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "headers": self.headers,
            "datatype": self.datatype,
            "row_count": self.row_count,
            "col_count": self.col_count,
            "value": self.value,
            "max_rows": self.max_rows,
            "max_cols": self.max_cols,
            "overflow_row_behaviour": self.overflow_row_behaviour,
            "wrap": self.wrap,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        max_rows: Optional[int] = None,
        max_cols: Optional[str] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "max_rows": max_rows,
            "max_cols": max_cols,
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def preprocess(self, x: DataframeData):
        """
        Parameters:
            x: 2D array of str, numeric, or bool data
        Returns:
            Dataframe in requested format
        """
        if self.type == "pandas":
            if x.get("headers") is not None:
                return pd.DataFrame(x["data"], columns=x.get("headers"))
            else:
                return pd.DataFrame(x["data"])
        if self.type == "numpy":
            return np.array(x["data"])
        elif self.type == "array":
            return x["data"]
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'pandas', 'numpy', 'array'."
            )

    def generate_sample(self):
        return [[1, 2, 3], [4, 5, 6]]

    def postprocess(
        self, y: str | pd.DataFrame | np.ndarray | List[List[str | float]] | Dict
    ) -> Dict:
        """
        Parameters:
            y: dataframe in given format
        Returns:
            JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
        """
        if y is None:
            return self.postprocess(self.test_input)
        if isinstance(y, dict):
            return y
        if isinstance(y, str):
            y = pd.read_csv(y)
            return {
                "headers": list(y.columns),
                "data": Dataframe.__process_markdown(
                    y.to_dict(orient="split")["data"], self.datatype
                ),
            }
        if isinstance(y, pd.DataFrame):
            return {
                "headers": list(y.columns),
                "data": Dataframe.__process_markdown(
                    y.to_dict(orient="split")["data"], self.datatype
                ),
            }
        if isinstance(y, (np.ndarray, list)):
            if isinstance(y, np.ndarray):
                y = y.tolist()

            _headers = self.headers

            if len(self.headers) < len(y[0]):
                _headers = [
                    *self.headers,
                    *list(range(len(self.headers) + 1, len(y[0]) + 1)),
                ]
            elif len(self.headers) > len(y[0]):
                _headers = self.headers[: len(y[0])]

            return {
                "headers": _headers,
                "data": Dataframe.__process_markdown(y, self.datatype),
            }
        raise ValueError("Cannot process value as a Dataframe")

    @staticmethod
    def __process_counts(count, default=3):
        if count is None:
            return (default, "dynamic")
        if type(count) == int or type(count) == float:
            return (int(count), "dynamic")
        else:
            return count

    @staticmethod
    def __validate_headers(headers: List[str] | None, col_count: int):
        if headers is not None and len(headers) != col_count:
            raise ValueError(
                "The length of the headers list must be equal to the col_count int.\nThe column count is set to {cols} but `headers` has {headers} items. Check the values passed to `col_count` and `headers`.".format(
                    cols=col_count, headers=len(headers)
                )
            )

    @classmethod
    def __process_markdown(cls, data: List[List[Any]], datatype: List[str]):
        if "markdown" not in datatype:
            return data

        if cls.markdown_parser is None:
            cls.markdown_parser = (
                MarkdownIt()
                .use(dollarmath_plugin, renderer=utils.tex2svg, allow_digits=False)
                .enable("table")
            )

        for i in range(len(data)):
            for j in range(len(data[i])):
                if datatype[j] == "markdown":
                    data[i][j] = Dataframe.markdown_parser.render(data[i][j])

        return data

    def style(
        self,
        **kwargs,
    ):
        """
        This method can be used to change the appearance of the DataFrame component.
        """
        return IOComponent.style(
            self,
            **kwargs,
        )

    def as_example(self, input_data: pd.DataFrame | np.ndarray | str | None):
        if input_data is None:
            return ""
        elif isinstance(input_data, pd.DataFrame):
            return input_data.head(n=5).to_dict(orient="split")["data"]
        elif isinstance(input_data, np.ndarray):
            return input_data.tolist()
        return input_data


@document("change", "style")
class Timeseries(Changeable, IOComponent, JSONSerializable):
    """
    Creates a component that can be used to upload/preview timeseries csv files or display a dataframe consisting of a time series graphically.
    Preprocessing: passes the uploaded timeseries data as a {pandas.DataFrame} into the function
    Postprocessing: expects a {pandas.DataFrame} or {str} path to a csv to be returned, which is then displayed as a timeseries graph
    Examples-format: a {str} filepath of csv data with time series data.
    Demos: fraud_detector
    """

    def __init__(
        self,
        value: Optional[str | Callable] = None,
        *,
        x: Optional[str] = None,
        y: str | List[str] = None,
        colors: List[str] = None,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: File path for the timeseries csv file. If callable, the function will be called whenever the app loads to set the initial value of the component.
            x: Column name of x (time) series. None if csv has no headers, in which case first column is x series.
            y: Column name of y series, or list of column names if multiple series. None if csv has no headers, in which case every column after first is a y series.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            colors: an ordered list of colors to use for each line plot
            show_label: if True, will display label.
            interactive: if True, will allow users to upload a timeseries csv; if False, can only be used to display timeseries data. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.x = x
        if isinstance(y, str):
            y = [y]
        self.y = y
        self.colors = colors
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "x": self.x,
            "y": self.y,
            "value": self.value,
            "colors": self.colors,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        colors: Optional[List[str]] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "colors": colors,
            "label": label,
            "show_label": show_label,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def preprocess(self, x: Dict | None) -> pd.DataFrame | None:
        """
        Parameters:
            x: Dict with keys 'data': 2D array of str, numeric, or bool data, 'headers': list of strings for header names, 'range': optional two element list designating start of end of subrange.
        Returns:
            Dataframe of timeseries data
        """
        if x is None:
            return x
        elif x.get("is_file"):
            dataframe = pd.read_csv(x["name"])
        else:
            dataframe = pd.DataFrame(data=x["data"], columns=x["headers"])
        if x.get("range") is not None:
            dataframe = dataframe.loc[dataframe[self.x or 0] >= x["range"][0]]
            dataframe = dataframe.loc[dataframe[self.x or 0] <= x["range"][1]]
        return dataframe

    def generate_sample(self):
        return {"data": [[1] + [2] * len(self.y)] * 4, "headers": [self.x] + self.y}

    def postprocess(self, y: str | pd.DataFrame) -> Dict:
        """
        Parameters:
            y: csv or dataframe with timeseries data
        Returns:
            JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
        """
        if y is None:
            return None
        if isinstance(y, str):
            y = pd.read_csv(y)
            return {"headers": y.columns.values.tolist(), "data": y.values.tolist()}
        if isinstance(y, pd.DataFrame):
            return {"headers": y.columns.values.tolist(), "data": y.values.tolist()}
        raise ValueError("Cannot process value as Timeseries data")

    def style(
        self,
        **kwargs,
    ):
        """
        This method can be used to change the appearance of the TimeSeries component.
        """
        return IOComponent.style(
            self,
            **kwargs,
        )


@document()
class State(IOComponent, SimpleSerializable):
    """
    Special hidden component that stores session state across runs of the demo by the
    same user. The value of the State variable is cleared when the user refreshes the page.

    Preprocessing: No preprocessing is performed
    Postprocessing: No postprocessing is performed
    Demos: chatbot_demo, blocks_simple_squares
    Guides: creating_a_chatbot, real_time_speech_recognition
    """

    allow_string_shortcut = False

    def __init__(
        self,
        value: Any = None,
        **kwargs,
    ):
        """
        Parameters:
            value: the initial value of the state. If callable, the function will be called whenever the app loads to set the initial value of the component.
        """
        self.stateful = True
        IOComponent.__init__(self, value=deepcopy(value), **kwargs)

    def style(self):
        return self


class Variable(State):
    """Variable was renamed to State. This class is kept for backwards compatibility."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_block_name(self):
        return "state"


@document("click", "style")
class Button(Clickable, IOComponent, SimpleSerializable):
    """
    Used to create a button, that can be assigned arbitrary click() events. The label (value) of the button can be used as an input or set via the output of a function.

    Preprocessing: passes the button value as a {str} into the function
    Postprocessing: expects a {str} to be returned from a function, which is set as the label of the button
    Demos: blocks_inputs, blocks_kinematics
    """

    def __init__(
        self,
        value: str | Callable = "Run",
        *,
        variant: str = "secondary",
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default text for the button to display. If callable, the function will be called whenever the app loads to set the initial value of the component.
            variant: 'primary' for main call-to-action, 'secondary' for a more subdued style
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        IOComponent.__init__(
            self, visible=visible, elem_id=elem_id, value=value, **kwargs
        )
        self.variant = variant

    def get_config(self):
        return {
            "value": self.value,
            "variant": self.variant,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[str] = _Keywords.NO_VALUE,
        variant: Optional[str] = None,
        visible: Optional[bool] = None,
    ):
        return {
            "variant": variant,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }

    def style(self, *, full_width: Optional[bool] = None, **kwargs):
        """
        This method can be used to change the appearance of the button component.
        Parameters:
            full_width: If True, will expand to fill parent container.
        """
        if full_width is not None:
            self._style["full_width"] = full_width

        return IOComponent.style(self, **kwargs)


@document("click", "upload", "style")
class UploadButton(
    Clickable, Uploadable, IOComponent, SimpleSerializable, TempFileManager
):
    """
    Used to create an upload button, when cicked allows a user to upload files that satisfy the specified file type or generic files (if file_type not set).
    Preprocessing: passes the uploaded file as a {file-object} or {List[file-object]} depending on `file_count` (or a {bytes}/{List{bytes}} depending on `type`)
    Postprocessing: expects function to return a {str} path to a file, or {List[str]} consisting of paths to files.
    Examples-format: a {str} path to a local file that populates the component.
    Demos: upload_button
    """

    def __init__(
        self,
        label: str = "Upload a File",
        value: Optional[str | List[str] | Callable] = None,
        *,
        visible: bool = True,
        elem_id: Optional[str] = None,
        type: str = "file",
        file_count: str = "single",
        file_types: List[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default text for the button to display.
            type: Type of value to be returned by component. "file" returns a temporary file object whose path can be retrieved by file_obj.name and original filename can be retrieved with file_obj.orig_name, "binary" returns an bytes object.
            file_count: if single, allows user to upload one file. If "multiple", user uploads multiple files. If "directory", user uploads all files in selected directory. Return type will be list for each file in case of "multiple" or "directory".
            file_types: List of type of files to be uploaded. "file" allows any file to be uploaded, "image" allows only image files to be uploaded, "audio" allows only audio files to be uploaded, "video" allows only video files to be uploaded, "text" allows only text files to be uploaded.
            label: Text to display on the button. Defaults to "Upload a File".
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.type = type
        self.file_count = file_count
        self.file_types = file_types
        self.label = label
        TempFileManager.__init__(self)
        IOComponent.__init__(
            self, label=label, visible=visible, elem_id=elem_id, value=value, **kwargs
        )

    def get_config(self):
        return {
            "label": self.label,
            "value": self.value,
            "file_count": self.file_count,
            "file_types": self.file_types,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[str] = _Keywords.NO_VALUE,
        interactive: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def preprocess(
        self, x: List[Dict[str, str]] | None
    ) -> tempfile._TemporaryFileWrapper | List[
        tempfile._TemporaryFileWrapper
    ] | bytes | List[bytes]:
        """
        Parameters:
            x: List of JSON objects with filename as 'name' property and base64 data as 'data' property
        Returns:
            File objects in requested format
        """
        if x is None:
            return None

        def process_single_file(f):
            file_name, data, is_file = (
                f["name"],
                f["data"],
                f.get("is_file", False),
            )
            if self.type == "file":
                if is_file:
                    temp_file_path = self.make_temp_copy_if_needed(file_name)
                    file = tempfile.NamedTemporaryFile(delete=False)
                    file.name = temp_file_path
                    file.orig_name = file_name
                else:
                    file = processing_utils.decode_base64_to_file(
                        data, file_path=file_name
                    )
                    file.orig_name = file_name
                return file
            elif self.type == "bytes":
                if is_file:
                    with open(file_name, "rb") as file_data:
                        return file_data.read()
                return processing_utils.decode_base64_to_binary(data)[0]
            else:
                raise ValueError(
                    "Unknown type: "
                    + str(self.type)
                    + ". Please choose from: 'file', 'bytes'."
                )

        if self.file_count == "single":
            if isinstance(x, list):
                return process_single_file(x[0])
            else:
                return process_single_file(x)
        else:
            if isinstance(x, list):
                return [process_single_file(f) for f in x]
            else:
                return process_single_file(x)

    def generate_sample(self):
        return deepcopy(media_data.BASE64_FILE)

    def serialize(self, x: str, load_dir: str = "", called_directly: bool = False):
        serialized = FileSerializable.serialize(self, x, load_dir, called_directly)
        serialized["size"] = os.path.getsize(serialized["name"])
        return serialized

    def style(self, *, full_width: Optional[bool] = None, **kwargs):
        """
        This method can be used to change the appearance of the button component.
        Parameters:
            full_width: If True, will expand to fill parent container.
        """
        if full_width is not None:
            self._style["full_width"] = full_width

        return IOComponent.style(self, **kwargs)


@document("change", "submit", "style")
class ColorPicker(Changeable, Submittable, IOComponent, SimpleSerializable):
    """
    Creates a color picker for user to select a color as string input.
    Preprocessing: passes selected color value as a {str} into the function.
    Postprocessing: expects a {str} returned from function and sets color picker value to it.
    Examples-format: a {str} with a hexadecimal representation of a color, e.g. "#ff0000" for red.
    Demos: color_picker, color_generator
    """

    def __init__(
        self,
        value: str | Callable = None,
        *,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: default text to provide in color picker. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            interactive: if True, will be rendered as an editable color picker; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.cleared_value = "#000000"
        self.test_input = value
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[str] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
        interactive: Optional[bool] = None,
    ):
        updated_config = {
            "value": value,
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    def preprocess(self, x: str | None) -> str | None:
        """
        Any preprocessing needed to be performed on function input.
        Parameters:
            x: text
        Returns:
            text
        """
        if x is None:
            return None
        else:
            return str(x)

    def generate_sample(self) -> str:
        return "#000000"

    def postprocess(self, y: str | None) -> str | None:
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
            y: text
        Returns:
            text
        """
        if y is None:
            return None
        else:
            return str(y)


############################
# Only Output Components
############################


@document("change", "style")
class Label(Changeable, IOComponent, JSONSerializable):
    """
    Displays a classification label, along with confidence scores of top categories, if provided.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {Dict[str, float]} of classes and confidences, or {str} with just the class or an {int}/{float} for regression outputs, or a {str} path to a .json file containing a json dictionary in the structure produced by Label.postprocess().

    Demos: main_note, titanic_survival
    Guides: Gradio_and_ONNX_on_Hugging_Face, image_classification_in_pytorch, image_classification_in_tensorflow, image_classification_with_vision_transformers, building_a_pictionary_app
    """

    CONFIDENCES_KEY = "confidences"

    def __init__(
        self,
        value: Optional[Dict[str, float] | str | float | Callable] = None,
        *,
        num_top_classes: Optional[int] = None,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        color: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value to show in the component. If a str or number is provided, simply displays the string or number. If a {Dict[str, float]} of classes and confidences is provided, displays the top class on top and the `num_top_classes` below, along with their confidence bars. If callable, the function will be called whenever the app loads to set the initial value of the component.
            num_top_classes: number of most confident classes to show.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            color: The background color of the label (either a valid css color name or hexadecimal string).
        """
        self.num_top_classes = num_top_classes
        self.color = color
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "num_top_classes": self.num_top_classes,
            "value": self.value,
            "color": self.color,
            **IOComponent.get_config(self),
        }

    def postprocess(self, y: Dict[str, float] | str | float | None) -> Dict | None:
        """
        Parameters:
            y: a dictionary mapping labels to confidence value, or just a string/numerical label by itself
        Returns:
            Object with key 'label' representing primary label, and key 'confidences' representing a list of label-confidence pairs
        """
        if y is None or y == {}:
            return None
        if isinstance(y, str) and y.endswith(".json") and os.path.exists(y):
            return self.serialize(y)
        if isinstance(y, (str, numbers.Number)):
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
            "Instead, got a {}".format(type(y))
        )

    @staticmethod
    def update(
        value: Optional[Dict[str, float] | str | float] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
        color: Optional[str] = _Keywords.NO_VALUE,
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
        updated_config = {
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "color": color,
            "__type__": "update",
        }
        return updated_config

    def style(
        self,
        *,
        container: Optional[bool] = None,
    ):
        """
        This method can be used to change the appearance of the label component.
        Parameters:
            container: If True, will add a container to the label - providing some extra padding around the border.
        """
        return IOComponent.style(self, container=container)


@document("change", "style")
class HighlightedText(Changeable, IOComponent, JSONSerializable):
    """
    Displays text that contains spans that are highlighted by category or numerical value.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {List[Tuple[str, float | str]]]} consisting of spans of text and their associated labels, or a {Dict} with two keys: (1) "text" whose value is the complete text, and "entities", which is a list of dictionaries, each of which have the keys: "entity" (consisting of the entity label), "start" (the character index where the label starts), and "end" (the character index where the label ends). Entities should not overlap.

    Demos: diff_texts, text_analysis
    Guides: named_entity_recognition
    """

    def __init__(
        self,
        value: Optional[List[Tuple[str, str | float | None]] | Dict | Callable] = None,
        *,
        color_map: Dict[str, str] = None,  # Parameter moved to HighlightedText.style()
        show_legend: bool = False,
        combine_adjacent: bool = False,
        adjacent_separator: str = "",
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value to show. If callable, the function will be called whenever the app loads to set the initial value of the component.
            show_legend: whether to show span categories in a separate legend or inline.
            combine_adjacent: If True, will merge the labels of adjacent tokens belonging to the same category.
            adjacent_separator: Specifies the separator to be used between tokens if combine_adjacent is True.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.color_map = color_map
        if color_map is not None:
            warnings.warn(
                "The 'color_map' parameter has been moved from the constructor to `HighlightedText.style()` ",
            )
        self.show_legend = show_legend
        self.combine_adjacent = combine_adjacent
        self.adjacent_separator = adjacent_separator
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "color_map": self.color_map,
            "show_legend": self.show_legend,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[
            List[Tuple[str, str | float | None]] | Dict
        ] = _Keywords.NO_VALUE,
        color_map: Optional[Dict[str, str]] = None,
        show_legend: Optional[bool] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "color_map": color_map,
            "show_legend": show_legend,
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def postprocess(
        self, y: List[Tuple[str, str | float | None]] | Dict | None
    ) -> List[Tuple[str, str | float | None]] | None:
        """
        Parameters:
            y: List of (word, category) tuples
        Returns:
            List of (word, category) tuples
        """
        if y is None:
            return None
        if isinstance(y, dict):
            try:
                text = y["text"]
                entities = y["entities"]
            except KeyError:
                raise ValueError(
                    "Expected a dictionary with keys 'text' and 'entities' for the value of the HighlightedText component."
                )
            if len(entities) == 0:
                y = [(text, None)]
            else:
                list_format = []
                index = 0
                entities = sorted(entities, key=lambda x: x["start"])
                for entity in entities:
                    list_format.append((text[index : entity["start"]], None))
                    list_format.append(
                        (text[entity["start"] : entity["end"]], entity["entity"])
                    )
                    index = entity["end"]
                list_format.append((text[index:], None))
                y = list_format
        if self.combine_adjacent:
            output = []
            running_text, running_category = None, None
            for text, category in y:
                if running_text is None:
                    running_text = text
                    running_category = category
                elif category == running_category:
                    running_text += self.adjacent_separator + text
                elif not text:
                    # Skip fully empty item, these get added in processing
                    # of dictionaries.
                    pass
                else:
                    output.append((running_text, running_category))
                    running_text = text
                    running_category = category
            if running_text is not None:
                output.append((running_text, running_category))
            return output
        else:
            return y

    def style(
        self,
        *,
        color_map: Optional[Dict[str, str]] = None,
        container: Optional[bool] = None,
        **kwargs,
    ):
        """
        This method can be used to change the appearance of the HighlightedText component.
        Parameters:
            color_map: Map between category and respective colors.
            container: If True, will place the component in a container - providing some extra padding around the border.
        """
        if color_map is not None:
            self._style["color_map"] = color_map

        return IOComponent.style(self, container=container, **kwargs)


@document("change", "style")
class JSON(Changeable, IOComponent, JSONSerializable):
    """
    Used to display arbitrary JSON output prettily.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a valid JSON {str} -- or a {list} or {dict} that is JSON serializable.

    Demos: zip_to_json, blocks_xray
    """

    def __init__(
        self,
        value: Optional[str | Callable] = None,
        *,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[Any] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
        interactive: Optional[bool] = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def postprocess(self, y: Dict | List | str | None) -> Dict | List | None:
        """
        Parameters:
            y: JSON output
        Returns:
            JSON output
        """
        if y is None:
            return None
        if isinstance(y, str):
            return json.dumps(y)
        else:
            return y

    def style(self, *, container: Optional[bool] = None, **kwargs):
        """
        This method can be used to change the appearance of the JSON component.
        Parameters:
            container: If True, will place the JSON in a container - providing some extra padding around the border.
        """
        return IOComponent.style(self, container=container, **kwargs)


@document("change")
class HTML(Changeable, IOComponent, SimpleSerializable):
    """
    Used to display arbitrary HTML output.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a valid HTML {str}.

    Demos: text_analysis
    Guides: key_features
    """

    def __init__(
        self,
        value: str | Callable = "",
        *,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[Any] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def style(self):
        return self


@document("style")
class Gallery(IOComponent, TempFileManager):
    """
    Used to display a list of images as a gallery that can be scrolled through.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a list of images in any format, {List[numpy.array | PIL.Image | str]}, or a {List} of (image, {str} caption) tuples and displays them.

    Demos: fake_gan
    """

    def __init__(
        self,
        value: Optional[List[np.ndarray | PIL.Image | str] | Callable] = None,
        *,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: List of images to display in the gallery by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        TempFileManager.__init__(self)
        super().__init__(
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def get_config(self):
        return {
            "value": self.value,
            **IOComponent.get_config(self),
        }

    def postprocess(
        self,
        y: List[np.ndarray | PIL.Image | str]
        | List[Tuple[np.ndarray | PIL.Image | str, str]]
        | None,
    ) -> List[str]:
        """
        Parameters:
            y: list of images, or list of (image, caption) tuples
        Returns:
            list of string file paths to images in temp directory
        """
        if y is None:
            return []
        output = []
        for img in y:
            caption = None
            if isinstance(img, tuple) or isinstance(img, list):
                img, caption = img
            if isinstance(img, np.ndarray):
                file = processing_utils.save_array_to_file(img)
                file_path = os.path.abspath(file.name)
                self.temp_files.add(file_path)
            elif isinstance(img, PIL.Image.Image):
                file = processing_utils.save_pil_to_file(img)
                file_path = os.path.abspath(file.name)
                self.temp_files.add(file_path)
            elif isinstance(img, str):
                if utils.validate_url(img):
                    file_path = img
                else:
                    file_path = self.make_temp_copy_if_needed(img)
            else:
                raise ValueError(f"Cannot process type as image: {type(img)}")

            if caption is not None:
                output.append(
                    [{"name": file_path, "data": None, "is_file": True}, caption]
                )
            else:
                output.append({"name": file_path, "data": None, "is_file": True})

        return output

    def style(
        self,
        *,
        grid: Optional[int | Tuple] = None,
        height: Optional[str] = None,
        container: Optional[bool] = None,
        **kwargs,
    ):
        """
        This method can be used to change the appearance of the gallery component.
        Parameters:
            grid: Represents the number of images that should be shown in one row, for each of the six standard screen sizes (<576px, <768px, <992px, <1200px, <1400px, >1400px). if fewer that 6 are given then the last will be used for all subsequent breakpoints
            height: Height of the gallery.
            container: If True, will place gallery in a container - providing some extra padding around the border.
        """
        if grid is not None:
            self._style["grid"] = grid
        if height is not None:
            self._style["height"] = height

        return IOComponent.style(self, container=container, **kwargs)

    def deserialize(
        self, x: Any, save_dir: str = "", encryption_key: bytes | None = None
    ) -> None | str:
        if x is None:
            return None
        gallery_path = os.path.join(save_dir, str(uuid.uuid4()))
        os.makedirs(gallery_path)
        captions = {}
        for img_data in x:
            if isinstance(img_data, list) or isinstance(img_data, tuple):
                img_data, caption = img_data
            else:
                caption = None
            name = FileSerializable.deserialize(self, img_data, gallery_path)
            captions[name] = caption
            captions_file = os.path.join(gallery_path, "captions.json")
            with open(captions_file, "w") as captions_json:
                json.dump(captions, captions_json)
        return os.path.abspath(gallery_path)

    def serialize(self, x: Any, load_dir: str = "", called_directly: bool = False):
        files = []
        captions_file = os.path.join(x, "captions.json")
        with open(captions_file) as captions_json:
            captions = json.load(captions_json)
        for file_name, caption in captions.items():
            img = FileSerializable.serialize(self, file_name)
            files.append([img, caption])
        return files


class Carousel(IOComponent, Changeable, SimpleSerializable):
    """
    Deprecated Component
    """

    def __init__(
        self,
        *args,
        **kwargs,
    ):
        raise DeprecationWarning(
            "The Carousel component is deprecated. Please consider using the Gallery "
            "component, which can be used to display images (and optional captions).",
        )


@document("change", "style")
class Chatbot(Changeable, IOComponent, JSONSerializable):
    """
    Displays a chatbot output showing both user submitted messages and responses. Supports a subset of Markdown including bold, italics, code, and images.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {List[Tuple[str, str]]}, a list of tuples with user inputs and responses as strings of HTML.

    Demos: chatbot_demo
    """

    def __init__(
        self,
        value: Optional[List[Tuple[str, str]] | Callable] = None,
        color_map: Dict[str, str] = None,  # Parameter moved to Chatbot.style()
        *,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value to show in chatbot. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        if color_map is not None:
            warnings.warn(
                "The 'color_map' parameter has been moved from the constructor to `Chatbot.style()` ",
            )
        self.color_map = color_map
        self.md = MarkdownIt()

        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "value": self.value,
            "color_map": self.color_map,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        color_map: Optional[Tuple[str, str]] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "color_map": color_map,
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def postprocess(self, y: List[Tuple[str, str]]) -> List[Tuple[str, str]]:
        """
        Parameters:
            y: List of tuples representing the message and response pairs. Each message and response should be a string, which may be in Markdown format.
        Returns:
            List of tuples representing the message and response. Each message and response will be a string of HTML.
        """
        if y is None:
            return []
        for i, (message, response) in enumerate(y):
            y[i] = (self.md.render(message), self.md.render(response))
        return y

    def style(self, *, color_map: Optional[List[str, str]] = None, **kwargs):
        """
        This method can be used to change the appearance of the Chatbot component.
        Parameters:
            color_map: List containing colors to apply to chat bubbles.
        Returns:

        """
        if color_map is not None:
            self._style["color_map"] = color_map

        return IOComponent.style(
            self,
            **kwargs,
        )


@document("change", "edit", "clear", "style")
class Model3D(
    Changeable, Editable, Clearable, IOComponent, FileSerializable, TempFileManager
):
    """
    Component allows users to upload or view 3D Model files (.obj, .glb, or .gltf).
    Preprocessing: This component passes the uploaded file as a {str} filepath.
    Postprocessing: expects function to return a {str} path to a file of type (.obj, glb, or .gltf)

    Demos: model3D
    Guides: how_to_use_3D_model_component
    """

    def __init__(
        self,
        value: Optional[str | Callable] = None,
        *,
        clear_color: List[float] = None,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: path to (.obj, glb, or .gltf) file to show in model3D viewer. If callable, the function will be called whenever the app loads to set the initial value of the component.
            clear_color: background color of scene
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.clear_color = clear_color or [0.2, 0.2, 0.2, 1.0]
        TempFileManager.__init__(self)
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "clearColor": self.clear_color,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def preprocess(self, x: Dict[str, str] | None) -> str | None:
        """
        Parameters:
            x: JSON object with filename as 'name' property and base64 data as 'data' property
        Returns:
            string file path to temporary file with the 3D image model
        """
        if x is None:
            return x
        file_name, file_data, is_file = (
            x["name"],
            x["data"],
            x.get("is_file", False),
        )
        if is_file:
            temp_file_path = self.make_temp_copy_if_needed(file_name)
        else:
            temp_file = processing_utils.decode_base64_to_file(
                file_data, file_path=file_name
            )
            temp_file_path = temp_file.name

        return temp_file_path

    def generate_sample(self):
        return media_data.BASE64_MODEL3D

    def postprocess(self, y: str | None) -> Dict[str, str] | None:
        """
        Parameters:
            y: path to the model
        Returns:
            file name mapped to base64 url data
        """
        if y is None:
            return y
        data = {
            "name": self.make_temp_copy_if_needed(y),
            "data": None,
            "is_file": True,
        }
        return data

    def style(self, **kwargs):
        """
        This method can be used to change the appearance of the Model3D component.
        """
        return IOComponent.style(
            self,
            **kwargs,
        )

    def as_example(self, input_data: str | None) -> str:
        return Path(input_data).name if input_data else ""


@document("change", "clear")
class Plot(Changeable, Clearable, IOComponent, JSONSerializable):
    """
    Used to display various kinds of plots (matplotlib, plotly, or bokeh are supported)
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects either a {matplotlib.figure.Figure}, a {plotly.graph_objects._figure.Figure}, or a {dict} corresponding to a bokeh plot (json_item format)

    Demos: altair_plot, outbreak_forecast, blocks_kinematics, stock_forecast, map_airbnb
    Guides: plot_component_for_maps
    """

    def __init__(
        self,
        value: Optional[Callable] = None,
        *,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Optionally, supply a default plot object to display, must be a matplotlib, plotly, altair, or bokeh figure, or a callable. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {"value": self.value, **IOComponent.get_config(self)}

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def postprocess(self, y: str | None) -> Dict[str, str] | None:
        """
        Parameters:
            y: plot data
        Returns:
            plot type mapped to plot base64 data
        """
        if y is None:
            return None
        if isinstance(y, (ModuleType, matplotlib.figure.Figure)):
            dtype = "matplotlib"
            out_y = processing_utils.encode_plot_to_base64(y)
        elif isinstance(y, dict):
            dtype = "bokeh"
            out_y = json.dumps(y)
        else:
            is_altair = "altair" in y.__module__
            if is_altair:
                dtype = "altair"
            else:
                dtype = "plotly"
            out_y = y.to_json()
        return {"type": dtype, "plot": out_y}

    def style(self, container: Optional[bool] = None):
        return IOComponent.style(
            self,
            container=container,
        )


@document("change", "clear")
class ScatterPlot(Plot):
    """
    Create a scatter plot.

    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a pandas dataframe with the data to plot.

    Demos: native_plots
    """

    def __init__(
        self,
        value: Optional[pd.DataFrame | Callable] = None,
        x: Optional[str] = None,
        y: Optional[str] = None,
        *,
        color: Optional[str] = None,
        size: Optional[str] = None,
        shape: Optional[str] = None,
        title: Optional[str] = None,
        tooltip: Optional[List[str] | str] = None,
        x_title: Optional[str] = None,
        y_title: Optional[str] = None,
        color_legend_title: Optional[str] = None,
        size_legend_title: Optional[str] = None,
        shape_legend_title: Optional[str] = None,
        height: Optional[int] = None,
        width: Optional[int] = None,
        caption: Optional[str] = None,
        interactive: Optional[bool] = True,
        label: Optional[str] = None,
        every: float | None = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
    ):
        """
        Parameters:
            value: The pandas dataframe containing the data to display in a scatter plot, or a callable. If callable, the function will be called whenever the app loads to set the initial value of the component.
            x: Column corresponding to the x axis.
            y: Column corresponding to the y axis.
            color: The column to determine the point color. If the column contains numeric data, gradio will interpolate the column data so that small values correspond to light colors and large values correspond to dark values.
            size: The column used to determine the point size. Should contain numeric data so that gradio can map the data to the point size.
            shape: The column used to determine the point shape. Should contain categorical data. Gradio will map each unique value to a different shape.
            title: The title to display on top of the chart.
            tooltip: The column (or list of columns) to display on the tooltip when a user hovers a point on the plot.
            x_title: The title given to the x axis. By default, uses the value of the x parameter.
            y_title: The title given to the y axis. By default, uses the value of the y parameter.
            color_legend_title: The title given to the color legend. By default, uses the value of color parameter.
            size_legend_title: The title given to the size legend. By default, uses the value of the size parameter.
            shape_legend_title: The title given to the shape legend. By default, uses the value of the shape parameter.
            height: The height of the plot in pixels.
            width: The width of the plot in pixels.
            caption: The (optional) caption to display below the plot.
            interactive: Whether users should be able to interact with the plot by panning or zooming with their mouse or trackpad.
            label: The (optional) label to display on the top left corner of the plot.
            show_label: Whether the label should be displayed.
            visible: Whether the plot should be visible.
            elem_id: Unique id used for custom css targetting.
        """
        self.x = x
        self.y = y
        self.color = color
        self.size = size
        self.shape = shape
        self.tooltip = tooltip
        self.title = title
        self.x_title = x_title
        self.y_title = y_title
        self.color_legend_title = color_legend_title
        self.size_legend_title = size_legend_title
        self.shape_legend_title = shape_legend_title
        self.caption = caption
        self.interactive_chart = interactive
        self.width = width
        self.height = height
        super().__init__(
            value=value,
            label=label,
            every=every,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
        )

    def get_config(self):
        config = super().get_config()
        config["caption"] = self.caption
        return config

    def get_block_name(self) -> str:
        return "plot"

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        x: Optional[str] = None,
        y: Optional[str] = None,
        color: Optional[str] = None,
        size: Optional[str] = None,
        shape: Optional[str] = None,
        title: Optional[str] = None,
        tooltip: Optional[List[str] | str] = None,
        x_title: Optional[str] = None,
        y_title: Optional[str] = None,
        color_legend_title: Optional[str] = None,
        size_legend_title: Optional[str] = None,
        shape_legend_title: Optional[str] = None,
        height: Optional[int] = None,
        width: Optional[int] = None,
        interactive: Optional[bool] = None,
        caption: Optional[str] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
    ):
        """Update an existing plot component.

        If updating any of the plot properties (color, size, etc) the value, x, and y parameters must be specified.

        Parameters:
            value: The pandas dataframe containing the data to display in a scatter plot.
            x: Column corresponding to the x axis.
            y: Column corresponding to the y axis.
            color: The column to determine the point color. If the column contains numeric data, gradio will interpolate the column data so that small values correspond to light colors and large values correspond to dark values.
            size: The column used to determine the point size. Should contain numeric data so that gradio can map the data to the point size.
            shape: The column used to determine the point shape. Should contain categorical data. Gradio will map each unique value to a different shape.
            title: The title to display on top of the chart.
            tooltip: The column (or list of columns) to display on the tooltip when a user hovers a point on the plot.
            x_title: The title given to the x axis. By default, uses the value of the x parameter.
            y_title: The title given to the y axis. By default, uses the value of the y parameter.
            color_legend_title: The title given to the color legend. By default, uses the value of color parameter.
            size_legend_title: The title given to the size legend. By default, uses the value of the size parameter.
            shape_legend_title: The title given to the shape legend. By default, uses the value of the shape parameter.
            height: The height of the plot in pixels.
            width: The width of the plot in pixels.
            caption: The (optional) caption to display below the plot.
            interactive: Whether users should be able to interact with the plot by panning or zooming with their mouse or trackpad.
            label: The (optional) label to display in the top left corner of the plot.
            show_label: Whether the label should be displayed.
            visible: Whether the plot should be visible.
        """
        properties = [
            x,
            y,
            color,
            size,
            shape,
            title,
            tooltip,
            x_title,
            y_title,
            color_legend_title,
            size_legend_title,
            shape_legend_title,
            interactive,
            height,
            width,
        ]
        if any(properties):
            if value is _Keywords.NO_VALUE:
                raise ValueError(
                    "In order to update plot properties the value parameter "
                    "must be provided. Please pass a value parameter to "
                    "gr.ScatterPlot.update."
                )
            if x is None or y is None:
                raise ValueError(
                    "In order to update plot properties, the x and y axis data "
                    "must be specified. Please pass valid values for x an y to "
                    "gr.ScatterPlot.update."
                )
            chart = ScatterPlot.create_plot(value, *properties)
            value = {"type": "altair", "plot": chart.to_json(), "chart": "scatter"}

        updated_config = {
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "caption": caption,
            "__type__": "update",
        }
        return updated_config

    @staticmethod
    def create_plot(
        value: pd.DataFrame,
        x: str,
        y: str,
        color: Optional[str] = None,
        size: Optional[str] = None,
        shape: Optional[str] = None,
        title: Optional[str] = None,
        tooltip: Optional[List[str] | str] = None,
        x_title: Optional[str] = None,
        y_title: Optional[str] = None,
        color_legend_title: Optional[str] = None,
        size_legend_title: Optional[str] = None,
        shape_legend_title: Optional[str] = None,
        height: Optional[int] = None,
        width: Optional[int] = None,
        interactive: Optional[bool] = True,
    ):
        """Helper for creating the scatter plot."""
        interactive = True if interactive is None else interactive
        encodings = dict(
            x=alt.X(x, title=x_title or x),
            y=alt.Y(y, title=y_title or y),
        )
        properties = {}
        if title:
            properties["title"] = title
        if height:
            properties["height"] = height
        if width:
            properties["width"] = width
        if color:
            if is_numeric_dtype(value[color]):
                domain = [value[color].min(), value[color].max()]
                range_ = [0, 1]
                type_ = "quantitative"
            else:
                domain = value[color].unique().tolist()
                range_ = list(range(len(domain)))
                type_ = "nominal"

            encodings["color"] = {
                "field": color,
                "type": type_,
                "legend": {"title": color_legend_title or color},
                "scale": {"domain": domain, "range": range_},
            }
        if tooltip:
            encodings["tooltip"] = tooltip
        if size:
            encodings["size"] = {
                "field": size,
                "type": "quantitative" if is_numeric_dtype(value[size]) else "nominal",
                "legend": {"title": size_legend_title or size},
            }
        if shape:
            encodings["shape"] = {
                "field": shape,
                "type": "quantitative" if is_numeric_dtype(value[shape]) else "nominal",
                "legend": {"title": shape_legend_title or shape},
            }
        chart = (
            alt.Chart(value)
            .mark_point()
            .encode(**encodings)
            .properties(background="transparent", **properties)
        )
        if interactive:
            chart = chart.interactive()

        return chart

    def postprocess(self, y: pd.DataFrame | Dict | None) -> Dict[str, str] | None:
        # if None or update
        if y is None or isinstance(y, Dict):
            return y
        chart = self.create_plot(
            value=y,
            x=self.x,
            y=self.y,
            color=self.color,
            size=self.size,
            shape=self.shape,
            title=self.title,
            tooltip=self.tooltip,
            x_title=self.x_title,
            y_title=self.y_title,
            color_legend_title=self.color_legend_title,
            size_legend_title=self.size_legend_title,
            shape_legend_title=self.size_legend_title,
            interactive=self.interactive_chart,
            height=self.height,
            width=self.width,
        )

        return {"type": "altair", "plot": chart.to_json(), "chart": "scatter"}


@document("change")
class Markdown(IOComponent, Changeable, SimpleSerializable):
    """
    Used to render arbitrary Markdown output. Can also render latex enclosed by dollar signs.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a valid {str} that can be rendered as Markdown.

    Demos: blocks_hello, blocks_kinematics
    Guides: key_features
    """

    def __init__(
        self,
        value: str | Callable = "",
        *,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Value to show in Markdown component. If callable, the function will be called whenever the app loads to set the initial value of the component.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.md = (
            MarkdownIt()
            .use(dollarmath_plugin, renderer=utils.tex2svg, allow_digits=False)
            .enable("table")
        )
        IOComponent.__init__(
            self, visible=visible, elem_id=elem_id, value=value, **kwargs
        )

    def postprocess(self, y: str | None) -> str | None:
        """
        Parameters:
            y: markdown representation
        Returns:
            HTML rendering of markdown
        """
        if y is None:
            return None
        unindented_y = inspect.cleandoc(y)
        return self.md.render(unindented_y)

    def get_config(self):
        return {
            "value": self.value,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        visible: Optional[bool] = None,
    ):
        updated_config = {
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def style(self):
        return self

    def as_example(self, input_data: str) -> str:
        return self.postprocess(input_data)


############################
# Special Components
############################


@document("click", "style")
class Dataset(Clickable, Component):
    """
    Used to create an output widget for showing datasets. Used to render the examples
    box.
    Preprocessing: passes the selected sample either as a {list} of data (if type="value") or as an {int} index (if type="index")
    Postprocessing: expects a {list} of {lists} corresponding to the dataset data.
    """

    def __init__(
        self,
        *,
        label: Optional[str] = None,
        components: List[IOComponent] | List[str],
        samples: List[List[Any]] = None,
        headers: Optional[List[str]] = None,
        type: str = "values",
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            components: Which component types to show in this dataset widget, can be passed in as a list of string names or Components instances. The following components are supported in a Dataset: Audio, Checkbox, CheckboxGroup, ColorPicker, Dataframe, Dropdown, File, HTML, Image, Markdown, Model3D, Number, Radio, Slider, Textbox, TimeSeries, Video
            samples: a nested list of samples. Each sublist within the outer list represents a data sample, and each element within the sublist represents an value for each component
            headers: Column headers in the Dataset widget, should be the same len as components. If not provided, inferred from component labels
            type: 'values' if clicking on a sample should pass the value of the sample, or "index" if it should pass the index of the sample
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        Component.__init__(self, visible=visible, elem_id=elem_id, **kwargs)
        self.components = [get_component_instance(c, render=False) for c in components]
        self.samples = [[]] if samples is None else samples
        for example in self.samples:
            for i, (component, ex) in enumerate(zip(self.components, example)):
                example[i] = component.as_example(ex)
        self.type = type
        self.label = label
        if headers is not None:
            self.headers = headers
        elif all([c.label is None for c in self.components]):
            self.headers = []
        else:
            self.headers = [c.label or "" for c in self.components]

    def get_config(self):
        return {
            "components": [component.get_block_name() for component in self.components],
            "headers": self.headers,
            "samples": self.samples,
            "type": self.type,
            "label": self.label,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        samples: Optional[Any] = _Keywords.NO_VALUE,
        visible: Optional[bool] = None,
        label: Optional[str] = None,
    ):
        return {
            "samples": samples,
            "visible": visible,
            "label": label,
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

    def postprocess(self, samples: List[List[Any]]) -> Dict:
        return {
            "samples": samples,
            "__type__": "update",
        }

    def style(self, **kwargs):
        """
        This method can be used to change the appearance of the Dataset component.
        """
        return IOComponent.style(self, **kwargs)


@document()
class Interpretation(Component):
    """
    Used to create an interpretation widget for a component.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {dict} with keys "original" and "interpretation".

    Guides: custom_interpretations_with_blocks
    """

    def __init__(
        self,
        component: Component,
        *,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            component: Which component to show in the interpretation widget.
            visible: Whether or not the interpretation is visible.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        Component.__init__(self, visible=visible, elem_id=elem_id, **kwargs)
        self.component = component

    def get_config(self):
        return {
            "component": self.component.get_block_name(),
            "component_props": self.component.get_config(),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        visible: Optional[bool] = None,
    ):
        return {
            "visible": visible,
            "value": value,
            "__type__": "update",
        }

    def style(self):
        return self

    def postprocess(self, y: Any) -> Any:
        return y


class StatusTracker(Component):
    """
    Used to indicate status of a function call. Event listeners can bind to a StatusTracker with 'status=' keyword argument.
    """

    def __init__(
        self,
        *,
        cover_container: bool = False,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            cover_container: If True, will expand to cover parent container while function pending.
        """
        Component.__init__(self, visible=visible, elem_id=elem_id, **kwargs)
        self.cover_container = cover_container

    def get_config(self):
        return {
            "cover_container": self.cover_container,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = _Keywords.NO_VALUE,
        visible: Optional[bool] = None,
    ):
        return {
            "visible": visible,
            "value": value,
            "__type__": "update",
        }


def component(cls_name: str) -> Component:
    obj = utils.component_or_layout_class(cls_name)()
    return obj


def get_component_instance(comp: str | dict | Component, render=True) -> Component:
    if isinstance(comp, str):
        component_obj = component(comp)
        if not (render):
            component_obj.unrender()
        return component_obj
    elif isinstance(comp, dict):
        name = comp.pop("name")
        component_cls = utils.component_or_layout_class(name)
        component_obj = component_cls(**comp)
        if not (render):
            component_obj.unrender()
        return component_obj
    elif isinstance(comp, Component):
        return comp
    else:
        raise ValueError(
            f"Component must provided as a `str` or `dict` or `Component` but is {comp}"
        )


Text = Textbox
DataFrame = Dataframe
Highlightedtext = HighlightedText
Highlight = HighlightedText
Checkboxgroup = CheckboxGroup
TimeSeries = Timeseries
Json = JSON
