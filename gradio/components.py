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
import shutil
import tempfile
import warnings
from copy import deepcopy
from types import ModuleType
from typing import Any, Callable, Dict, List, Optional, Tuple

import matplotlib.figure
import numpy as np
import pandas as pd
import PIL
from ffmpy import FFmpeg
from markdown_it import MarkdownIt

from gradio import media_data, processing_utils
from gradio.blocks import Block
from gradio.events import (
    Changeable,
    Clearable,
    Clickable,
    Editable,
    Playable,
    Streamable,
    Submittable,
)
from gradio.utils import component_or_layout_class


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


class IOComponent(Component):
    """
    A base class for defining methods that all input/output components should have.
    """

    def __init__(
        self,
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        requires_permissions: bool = False,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        self.label = label
        self.show_label = show_label
        self.requires_permissions = requires_permissions
        self.interactive = interactive

        self.set_interpret_parameters()

        super().__init__(elem_id=elem_id, visible=visible, **kwargs)

    def get_config(self):
        return {
            "label": self.label,
            "show_label": self.show_label,
            "interactive": self.interactive,
            **super().get_config(),
        }

    def save_flagged(
        self, dir: str, label: Optional[str], data: Any, encryption_key: bool
    ) -> Any:
        """
        Saves flagged data from component
        """
        return data

    def restore_flagged(self, dir, data, encryption_key):
        """
        Restores flagged data from logs
        """
        return data

    def save_file(self, file: tempfile._TemporaryFileWrapper, dir: str, label: str):
        """
        Saved flagged file and returns filepath
        """
        label = "".join([char for char in label if char.isalnum() or char in "._- "])
        old_file_name = file.name
        output_dir = os.path.join(dir, label)
        if os.path.exists(output_dir):
            file_index = len(os.listdir(output_dir))
        else:
            os.makedirs(output_dir)
            file_index = 0
        new_file_name = str(file_index)
        if "." in old_file_name:
            uploaded_format = old_file_name.split(".")[-1].lower()
            new_file_name += "." + uploaded_format
        file.close()
        shutil.move(old_file_name, os.path.join(dir, label, new_file_name))
        return label + "/" + new_file_name

    def save_flagged_file(
        self,
        dir: str,
        label: str,
        data: Any,
        encryption_key: bool,
        file_path: Optional[str] = None,
    ) -> Optional[str]:
        """
        Saved flagged data (e.g. image or audio) as a file and returns filepath
        """
        if data is None:
            return None
        file = processing_utils.decode_base64_to_file(data, encryption_key, file_path)
        return self.save_file(file, dir, label)

    def restore_flagged_file(
        self,
        dir: str,
        file: str,
        encryption_key: bool,
        as_data: bool = False,
    ) -> Dict[str, Any]:
        """
        Loads flagged data from file and returns it
        """
        if as_data:
            data = processing_utils.encode_file_to_base64(
                os.path.join(dir, file), encryption_key=encryption_key
            )
            return {"name": file, "data": data}
        else:
            return {
                "name": os.path.join(dir, file),
                "data": os.path.join(dir, file),
                "file_name": file,
                "is_example": True,
            }

    # Input Functionalities
    def preprocess(self, x: Any) -> Any:
        """
        Any preprocessing needed to be performed on function input.
        """
        return x

    def serialize(self, x: Any, called_directly: bool) -> Any:
        """
        Convert from a human-readable version of the input (path of an image, URL of a video, etc.) into the interface to a serialized version (e.g. base64) to pass into an API. May do different things if the interface is called() vs. used via GUI.
        Parameters:
        x (Any): Input to interface
        called_directly (bool): if true, the interface was called(), otherwise, it is being used via the GUI
        """
        return x

    def preprocess_example(self, x: Any) -> Any:
        """
        Any preprocessing needed to be performed on an example before being passed to the main function.
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
        x (Any): Input to interface
        Returns: (neighbor_values, interpret_kwargs, interpret_by_removal)
        neighbor_values (List[Any]): Neighboring values to input x to compute for interpretation
        interpret_kwargs (Dict[Any]): Keyword arguments to be passed to get_interpretation_scores
        interpret_by_removal (bool): If True, returned neighbors are values where the interpreted subsection was removed. If False, returned neighbors are values where the interpreted subsection was modified to a different value.
        """
        return [], {}, True

    def get_interpretation_scores(
        self, x: Any, neighbors: List[Any], scores: List[float], **kwargs
    ) -> List[Any]:
        """
        Arrange the output values from the neighbors into interpretation scores for the interface to render.
        Parameters:
        x (Any): Input to interface
        neighbors (List[Any]): Neighboring values to input x used for interpretation.
        scores (List[float]): Output value corresponding to each neighbor in neighbors
        kwargs (Dict[str, Any]): Any additional arguments passed from get_interpretation_neighbors.
        Returns:
        (List[Any]): Arrangement of interpretation scores for interfaces to render.
        """
        pass

    def generate_sample(self) -> Any:
        """
        Returns a sample value of the input that would be accepted by the api. Used for api documentation.
        """
        pass

    # Output Functionalities
    def postprocess(self, y):
        """
        Any postprocessing needed to be performed on function output.
        """
        return y

    def deserialize(self, x):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return x

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        border: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        container: Optional[bool] = None,
    ):
        if rounded is not None:
            self._style["rounded"] = rounded
        if border is not None:
            self._style["border"] = border
        if container is not None:
            self._style["container"] = container
        return self

    @classmethod
    def document_parameters(cls, target):
        if target == "input":
            doc = inspect.getdoc(cls.preprocess)
            if "Parameters:\nx (" in doc:
                return doc.split("Parameters:\nx ")[1].split("\n")[0]
            return None
        elif target == "output":
            doc = inspect.getdoc(cls.postprocess)
            if "Returns:\n" in doc:
                return doc.split("Returns:\n")[1].split("\n")[0]
            return None
        else:
            raise ValueError("Invalid doumentation target.")

    @staticmethod
    def add_interactive_to_config(config, interactive):
        if interactive is not None:
            config["mode"] = "dynamic" if interactive else "static"
        return config


class Textbox(Changeable, Submittable, IOComponent):
    """
    Creates a textarea for user to enter string input or display string output.
    Preprocessing: passes textarea value as a {str} into the function.
    Postprocessing: expects a {str} returned from function and sets textarea value to it.

    Demos: hello_world, diff_texts, sentence_builder
    """

    def __init__(
        self,
        value: str = "",
        *,
        lines: int = 1,
        max_lines: int = 20,
        placeholder: Optional[str] = None,
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (str): default text to provide in textarea.
        lines (int): minimum number of line rows to provide in textarea.
        max_lines (int): maximum number of line rows to provide in textarea.
        placeholder (str): placeholder hint to provide behind textarea.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, will be rendered as an editable textbox; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.lines = lines
        self.max_lines = max_lines
        self.placeholder = placeholder
        self.value = self.postprocess(value)
        self.cleared_value = ""
        self.test_input = value
        self.interpret_by_tokens = True
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "lines": self.lines,
            "max_lines": self.max_lines,
            "placeholder": self.placeholder,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
        lines: Optional[int] = None,
        max_lines: Optional[int] = None,
        placeholder: Optional[str] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
        interactive: Optional[bool] = None,
    ):
        updated_config = {
            "lines": lines,
            "max_lines": max_lines,
            "placeholder": placeholder,
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    # Input Functionalities
    def preprocess(self, x: str | None) -> Any:
        """
        Any preprocessing needed to be performed on function input.
        Parameters:
        x (str): text
        Returns:
        (str): text
        """
        if x is None:
            return None
        else:
            return str(x)

    def serialize(self, x: Any, called_directly: bool) -> Any:
        """
        Convert from a human-readable version of the input (path of an image, URL of a video, etc.) into the interface to a serialized version (e.g. base64) to pass into an API. May do different things if the interface is called() vs. used via GUI.
        Parameters:
        x (Any): Input to interface
        called_directly (bool): if true, the interface was called(), otherwise, it is being used via the GUI
        """
        return x

    def preprocess_example(self, x: str | None) -> Any:
        """
        Any preprocessing needed to be performed on an example before being passed to the main function.
        """
        if x is None:
            return None
        else:
            return str(x)

    def set_interpret_parameters(
        self, separator: str = " ", replacement: Optional[str] = None
    ):
        """
        Calculates interpretation score of characters in input by splitting input into tokens, then using a "leave one out" method to calculate the score of each token by removing each token and measuring the delta of the output value.
        Parameters:
        separator (str): Separator to use to split input into tokens.
        replacement (str): In the "leave one out" step, the text that the token should be replaced with. If None, the token is removed altogether.
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
        (List[Tuple[str, float]]): Each tuple set represents a set of characters and their corresponding interpretation score.
        """
        result = []
        for token, score in zip(tokens, scores):
            result.append((token, score))
            result.append((self.interpretation_separator, 0))
        return result

    def generate_sample(self) -> str:
        return "Hello World"

    # Output Functionalities
    def postprocess(self, y: str | None):
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
        y (str | None): text
        Returns:
        (str | None): text
        """
        if y is None:
            return None
        else:
            return str(y)

    def deserialize(self, x):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return x


class Number(Changeable, Submittable, IOComponent):
    """
    Creates a numeric field for user to enter numbers as input or display numeric output.
    Preprocessing: passes field value as a {float} or {int} into the function, depending on `precision`.
    Postprocessing: expects an {int} or {float} returned from the function and sets field value to it.

    Demos: tax_calculator, titanic_survival, blocks_simple_squares
    """

    def __init__(
        self,
        value: Optional[float] = None,
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        precision: Optional[int] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (float): default value.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, will be editable; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        precision (Optional[int]): Precision to round input/output to. If set to 0, will round to nearest integer and covert type to int. If None, no rounding happens.
        """
        self.precision = precision
        self.value = self.postprocess(value)
        self.test_input = self.value if self.value is not None else 1
        self.interpret_by_tokens = False
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    @staticmethod
    def round_to_precision(
        num: float | int | None, precision: int | None
    ) -> float | int | None:
        """
        Round to a given precision.

        If precision is None, no rounding happens. If 0, num is converted to int.

        Parameters:
        num (float | int): Number to round.
        precision (int | None): Precision to round to.
        Returns:
        (float | int): rounded number
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
        value: Optional[Any] = None,
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
        x (float | None): numeric input
        Returns:
        (float | None): number representing function input
        """
        if x is None:
            return None
        return self.round_to_precision(x, self.precision)

    def preprocess_example(self, x: float | None) -> float | None:
        """
        Returns:
        (float | None): Number representing function input
        """
        if x is None:
            return None
        else:
            return self.round_to_precision(x, self.precision)

    def set_interpret_parameters(
        self, steps: int = 3, delta: float = 1, delta_type: str = "percent"
    ):
        """
        Calculates interpretation scores of numeric values close to the input number.
        Parameters:
        steps (int): Number of nearby values to measure in each direction (above and below the input number).
        delta (float): Size of step in each direction between nearby values.
        delta_type (str): "percent" if delta step between nearby values should be a calculated as a percent, or "absolute" if delta should be a constant step change.
        """
        self.interpretation_steps = steps
        self.interpretation_delta = delta
        self.interpretation_delta_type = delta_type
        return self

    def get_interpretation_neighbors(self, x: float | int) -> Tuple[List[float], Dict]:
        x = self.round_to_precision(x, self.precision)
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
        (List[Tuple[float, float]]): Each tuple set represents a numeric value near the input and its corresponding interpretation score.
        """
        interpretation = list(zip(neighbors, scores))
        interpretation.insert(int(len(interpretation) / 2), [x, None])
        return interpretation

    def generate_sample(self) -> float:
        return self.round_to_precision(1, self.precision)

    # Output Functionalities
    def postprocess(self, y: float | None) -> float | None:
        """
        Any postprocessing needed to be performed on function output.

        Parameters:
        y (float | None): numeric output
        Returns:
        (float | None): number representing function output
        """
        if y is None:
            return None
        else:
            return self.round_to_precision(y, self.precision)

    def deserialize(self, y):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return y


class Slider(Changeable, IOComponent):
    """
    Creates a slider that ranges from `minimum` to `maximum` with a step size of `step`.
    Preprocessing: passes slider value as a {float} into the function.
    Postprocessing: expects an {int} or {float} returned from function and sets slider value to it as long as it is within range.

    Demos: sentence_builder, generate_tone, titanic_survival
    """

    def __init__(
        self,
        minimum: float = 0,
        maximum: float = 100,
        value: Optional[float] = None,
        *,
        step: Optional[float] = None,
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        minimum (float): minimum value for slider.
        maximum (float): maximum value for slider.
        value (float): default value.
        step (float): increment between slider values.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, slider will be adjustable; if False, adjusting will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.minimum = minimum
        self.maximum = maximum
        if step is None:
            difference = maximum - minimum
            power = math.floor(math.log10(difference) - 2)
            step = 10**power
        self.step = step
        self.value = self.postprocess(value)
        self.cleared_value = self.value
        self.test_input = self.value
        self.interpret_by_tokens = False
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "minimum": self.minimum,
            "maximum": self.maximum,
            "step": self.step,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def preprocess(self, x: float) -> float:
        """
        Parameters:
        x (number): numeric input
        Returns:
        (number): numeric input
        """
        return x

    def preprocess_example(self, x: float) -> float:
        """
        Returns:
        (float): Number representing function input
        """
        return x

    def set_interpret_parameters(self, steps: int = 8) -> "Slider":
        """
        Calculates interpretation scores of numeric values ranging between the minimum and maximum values of the slider.
        Parameters:
        steps (int): Number of neighboring values to measure between the minimum and maximum values of the slider range.
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
        (List[float]): Each value represents the score corresponding to an evenly spaced range of inputs between the minimum and maximum slider values.
        """
        return scores

    def generate_sample(self) -> float:
        return self.maximum

        # Output Functionalities

    def postprocess(self, y: float | None):
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
        y (float | None): numeric output
        Returns:
        (float): numeric output or minimum number if None
        """
        return self.minimum if y is None else y

    def deserialize(self, y):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return y

    def style(
        self,
        container: Optional[bool] = None,
    ):
        return IOComponent.style(
            self,
            container=container,
        )


class Checkbox(Changeable, IOComponent):
    """
    Creates a checkbox that can be set to `True` or `False`.

    Preprocessing: passes the status of the checkbox as a {bool} into the function.
    Postprocessing: expects a {bool} returned from the function and, if it is True, checks the checkbox.
    Demos: sentence_builder, titanic_survival
    """

    def __init__(
        self,
        value: bool = False,
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (bool): if True, checked by default.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, this checkbox can be checked; if False, checking will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.test_input = True
        self.value = self.postprocess(value)
        self.interpret_by_tokens = False
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def preprocess(self, x: bool) -> bool:
        """
        Parameters:
        x (bool): boolean input
        Returns:
        (bool): boolean input
        """
        return x

    def preprocess_example(self, x):
        """
        Returns:
        (bool): Boolean representing function input
        """
        return x

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
        (Tuple[float, float]): The first value represents the interpretation score if the input is False, and the second if the input is True.
        """
        if x:
            return scores[0], None
        else:
            return None, scores[0]

    def generate_sample(self):
        return True

    # Output Functionalities
    def postprocess(self, y):
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
        y (bool): boolean output
        Returns:
        (bool): boolean output
        """
        return y

    def deserialize(self, x):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return x


class CheckboxGroup(Changeable, IOComponent):
    """
    Creates a set of checkboxes of which a subset can be checked.
    Preprocessing: passes the list of checked checkboxes as a {List[str]} or their indices as a {List[int]} into the function, depending on `type`.
    Postprocessing: expects a {List[str]}, each element of which becomes a checked checkbox.

    Demos: sentence_builder, titanic_survival
    """

    def __init__(
        self,
        choices: Optional[List[str]] = None,
        *,
        value: List[str] = None,
        type: str = "value",
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        value (List[str]): default selected list of options.
        type (str): Type of value to be returned by component. "value" returns the list of strings of the choices selected, "index" returns the list of indicies of the choices selected.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, choices in this checkbox group will be checkable; if False, checking will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.choices = choices or []
        self.cleared_value = []
        self.type = type
        self.value = self.postprocess(value)
        self.test_input = self.choices
        self.interpret_by_tokens = False
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[Any] = None,
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

    def preprocess(self, x: List[str]) -> List[str] | List[int]:
        """
        Parameters:
        x (List[str]): list of selected choices
        Returns:
        (List[str] | List[int]): list of selected choices as strings or indices within choice list
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
        (List[Tuple[float, float]]): For each tuple in the list, the first value represents the interpretation score if the input is False, and the second if the input is True.
        """
        final_scores = []
        for choice, score in zip(self.choices, scores):
            if choice in x:
                score_set = [score, None]
            else:
                score_set = [None, score]
            final_scores.append(score_set)
        return final_scores

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (List[str]])
        """
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)

    def generate_sample(self):
        return self.choices

    # Output Functionalities
    def postprocess(self, y):
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
        y (List[str]): List of selected choices
        Returns:
        (List[str]): List of selected choices
        """
        return [] if y is None else y

    def deserialize(self, x):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return x

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        item_container: Optional[bool] = None,
        container: Optional[bool] = None,
    ):
        if item_container is not None:
            self._style["item_container"] = item_container

        return IOComponent.style(
            self,
            rounded=rounded,
            container=container,
        )


class Radio(Changeable, IOComponent):
    """
    Creates a set of radio buttons of which only one can be selected.
    Preprocessing: passes the value of the selected radio button as a {str} or its index as an {int} into the function, depending on `type`.
    Postprocessing: expects a {str} corresponding to the value of the radio button to be selected.

    Demos: sentence_builder, titanic_survival, blocks_essay
    """

    def __init__(
        self,
        choices: Optional[List[str]] = None,
        *,
        value: Optional[str] = None,
        type: str = "value",
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        value (str): the button selected by default. If None, no button is selected by default.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, choices in this radio group will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.choices = choices or []
        self.type = type
        self.test_input = self.choices[0] if len(self.choices) else None
        self.value = self.postprocess(value)
        self.cleared_value = self.value
        self.interpret_by_tokens = False
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[Any] = None,
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

    def preprocess(self, x: str) -> str | int:
        """
        Parameters:
        x (str): selected choice
        Returns:
        (str | int): selected choice as string or index within choice list
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

    def get_interpretation_scores(self, x, neighbors, scores, **kwargs):
        """
        Returns:
        (List[float]): Each value represents the interpretation score corresponding to each choice.
        """
        scores.insert(self.choices.index(x), None)
        return scores

    def generate_sample(self):
        return self.choices[0]

    # Output Functionalities
    def postprocess(self, y):
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
        y (str): string of choice
        Returns:
        (str): string of choice
        """
        return (
            y if y is not None else self.choices[0] if len(self.choices) > 0 else None
        )

    def deserialize(self, x):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return x

    def style(
        self,
        item_container: Optional[bool] = None,
        container: Optional[bool] = None,
    ):
        if item_container is not None:
            self._style["item_container"] = item_container

        return IOComponent.style(
            self,
            container=container,
        )


class Dropdown(Radio):
    """
    Creates a dropdown of which only one entry can be selected.
    Preprocessing: passes the value of the selected dropdown entry as a {str} or its index as an {int} into the function, depending on `type`.
    Postprocessing: expects a {str} corresponding to the value of the dropdown entry to be selected.

    Demos: sentence_builder, titanic_survival
    """

    def __init__(
        self,
        choices: Optional[List[str]] = None,
        *,
        value: Optional[str] = None,
        type: str = "value",
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        value (str): default value selected in dropdown. If None, no value is selected by default.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, choices in this dropdown will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        Radio.__init__(
            self,
            value=value,
            choices=choices,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        border: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        container: Optional[bool] = None,
    ):
        return IOComponent.style(
            self, rounded=rounded, border=border, container=container
        )


class Image(Editable, Clearable, Changeable, Streamable, IOComponent):
    """
    Creates an image component that can be used to upload/draw images (as an input) or display images (as an output).
    Preprocessing: passes the uploaded image as a {numpy.array}, {PIL.Image} or {str} filepath depending on `type` -- unless `tool` is `sketch`. In the special case, a {dict} with keys `image` and `mask` is passed, and the format of the corresponding values depends on `type`.
    Postprocessing: expects a {numpy.array}, {PIL.Image} or {str} filepath to an image and displays the image.

    Demos: image_classifier, image_mod, webcam, digit_classifier, blocks_mask
    """

    def __init__(
        self,
        value: Optional[str | PIL.Image | np.narray] = None,
        *,
        shape: Tuple[int, int] = None,
        image_mode: str = "RGB",
        invert_colors: bool = False,
        source: str = "upload",
        tool: str = "editor",
        type: str = "numpy",
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        streaming: bool = False,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (Optional[str | PIL.Image | np.narray]): A PIL Image, numpy array, path or URL for the default value that Image component is going to take.
        shape (Tuple[int, int]): (width, height) shape to crop and resize image to; if None, matches input image size. Pass None for either width or height to only crop and resize the other.
        image_mode (str): "RGB" if color, or "L" if black and white.
        invert_colors (bool): whether to invert the image as a preprocessing step.
        source (str): Source of image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "canvas" defaults to a white image that can be edited and drawn upon with tools.
        tool (str): Tools used for editing. "editor" allows a full screen editor, "select" provides a cropping and zoom tool, "sketch" allows you to create a mask over the image and both the image and mask are passed into the function.
        type (str): The format the image is converted to before being passed into the prediction function. "numpy" converts the image to a numpy array with shape (width, height, 3) and values from 0 to 255, "pil" converts the image to a PIL image object, "file" produces a temporary file object whose path can be retrieved by file_obj.name, "filepath" passes a str path to a temporary file containing the image.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, will allow users to upload and edit an image; if False, can only be used to display images. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        streaming (bool): If True when used in a `live` interface, will automatically stream webcam feed. Only valid is source is 'webcam'.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.type = type
        self.value = self.postprocess(value)
        self.shape = shape
        self.image_mode = image_mode
        self.source = source
        requires_permissions = source == "webcam"
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
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            requires_permissions=requires_permissions,
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
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def format_image(
        self, im: Optional[PIL.Image], fmt: str
    ) -> np.array | PIL.Image | str | None:
        """Helper method to format an image based on self.type"""
        if im is None:
            return im
        if self.type == "pil":
            return im
        elif self.type == "numpy":
            return np.array(im)
        elif self.type == "file" or self.type == "filepath":
            file_obj = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=("." + fmt.lower() if fmt is not None else ".png"),
            )
            im.save(file_obj.name)
            if self.type == "file":
                warnings.warn(
                    "The 'file' type has been deprecated. Set parameter 'type' to 'filepath' instead.",
                    DeprecationWarning,
                )
                return file_obj
            else:
                return file_obj.name
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'numpy', 'pil', 'filepath'."
            )

    def preprocess(self, x: Optional[str]) -> np.array | PIL.Image | str | None:
        """
        Parameters:
        x (str | dict): base64 url data, or (if tool == "sketch) a dict of image and mask base64 url data
        Returns:
        (numpy.array | PIL.Image | str): image in requested format
        """
        if x is None:
            return x
        if self.tool == "sketch":
            x, mask = x["image"], x["mask"]

        im = processing_utils.decode_base64_to_image(x)
        fmt = im.format
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            im = im.convert(self.image_mode)
        if self.shape is not None:
            im = processing_utils.resize_and_crop(im, self.shape)
        if self.invert_colors:
            im = PIL.ImageOps.invert(im)

        if not (self.tool == "sketch"):
            return self.format_image(im, fmt)

        mask_im = processing_utils.decode_base64_to_image(mask)
        mask_fmt = mask_im.format
        return {
            "image": self.format_image(im, fmt),
            "mask": self.format_image(mask_im, mask_fmt),
        }

    def preprocess_example(self, x):
        return processing_utils.encode_file_to_base64(x)

    def serialize(self, x, called_directly=False):
        # if called directly, can assume it's a URL or filepath
        if self.type == "filepath" or called_directly:
            return processing_utils.encode_url_or_file_to_base64(x)
        elif self.type == "file":
            return processing_utils.encode_url_or_file_to_base64(x.name)
        elif self.type in ("numpy", "pil"):
            if self.type == "numpy":
                x = PIL.Image.fromarray(np.uint8(x)).convert("RGB")
            fmt = x.format
            file_obj = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=("." + fmt.lower() if fmt is not None else ".png"),
            )
            x.save(file_obj.name)
            return processing_utils.encode_url_or_file_to_base64(file_obj.name)
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'numpy', 'pil', 'filepath'."
            )

    def set_interpret_parameters(self, segments=16):
        """
        Calculates interpretation score of image subsections by splitting the image into subsections, then using a "leave one out" method to calculate the score of each subsection by whiting out the subsection and measuring the delta of the output value.
        Parameters:
        segments (int): Number of interpretation segments to split image into.
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
    ):
        """
        Returns:
        (List[List[float]]): A 2D array representing the interpretation score of each pixel of the image.
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

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to image file
        """
        return self.save_flagged_file(dir, label, data, encryption_key)

    def restore_flagged(self, dir, data, encryption_key):
        return processing_utils.encode_file_to_base64(
            os.path.join(dir, data), encryption_key=encryption_key
        )

    def generate_sample(self):
        return deepcopy(media_data.BASE64_IMAGE)

    # Output functions

    def postprocess(self, y):
        """
        Parameters:
        y (numpy.array | PIL.Image | str): image in specified format
        Returns:
        (str): base64 url data
        """
        if y is None:
            return None
        if isinstance(y, np.ndarray):
            dtype = "numpy"
        elif isinstance(y, PIL.Image.Image):
            dtype = "pil"
        elif isinstance(y, str):
            dtype = "file"
        else:
            raise ValueError("Cannot process this value as an Image")
        if dtype in ["numpy", "pil"]:
            if dtype == "pil":
                y = np.array(y)
            out_y = processing_utils.encode_array_to_base64(y)
        elif dtype == "file":
            out_y = processing_utils.encode_url_or_file_to_base64(y)
        return out_y

    def deserialize(self, x):
        return processing_utils.decode_base64_to_file(x).name

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        height: Optional[int] = None,
        width: Optional[int] = None,
    ):
        self._style["height"] = height
        self._style["width"] = width
        return IOComponent.style(
            self,
            rounded=rounded,
        )

    def stream(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        _js: Optional[str] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        Returns: None
        """
        if self.source != "webcam":
            raise ValueError("Image streaming only available if source is 'webcam'.")
        Streamable.stream(self, fn, inputs, outputs, _js)


class Video(Changeable, Clearable, Playable, IOComponent):
    """
    Creates an video component that can be used to upload/record videos (as an input) or display videos (as an output).
    Preprocessing: passes the uploaded video as a {str} filepath whose extension can be set by `format`.
    Postprocessing: expects a {str} filepath to a video which is displayed.

    Demos: video_identity
    """

    def __init__(
        self,
        value: Optional[str] = None,
        *,
        format: Optional[str] = None,
        source: str = "upload",
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (str): A path or URL for the default value that Video component is going to take.
        format (str): Format of video format to be returned by component, such as 'avi' or 'mp4'. Use 'mp4' to ensure browser playability. If set to None, video will keep uploaded format.
        source (str): Source of video. "upload" creates a box where user can drop an video file, "webcam" allows user to record a video from their webcam.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, will allow users to upload a video; if False, can only be used to display videos. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.format = format
        self.source = source
        self.value = self.postprocess(value)
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "source": self.source,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def preprocess_example(self, x):
        return {"name": x, "data": None, "is_example": True}

    def preprocess(self, x: Dict[str, str] | None) -> str | None:
        """
        Parameters:
        x (Dict[name: str, data: str]): JSON object with filename as 'name' property and base64 data as 'data' property
        Returns:
        (str): file path to video
        """
        if x is None:
            return x
        file_name, file_data, is_example = (
            x["name"],
            x["data"],
            x.get("is_example", False),
        )
        if is_example:
            file = processing_utils.create_tmp_copy_of_file(file_name)
        else:
            file = processing_utils.decode_base64_to_file(
                file_data, file_path=file_name
            )
        file_name = file.name
        uploaded_format = file_name.split(".")[-1].lower()
        if self.format is not None and uploaded_format != self.format:
            output_file_name = file_name[0 : file_name.rindex(".") + 1] + self.format
            ff = FFmpeg(inputs={file_name: None}, outputs={output_file_name: None})
            ff.run()
            return output_file_name
        else:
            return file_name

    def serialize(self, x, called_directly):
        data = processing_utils.encode_url_or_file_to_base64(x)
        return {"name": x, "data": data, "is_example": False}

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to video file
        """
        return self.save_flagged_file(
            dir, label, None if data is None else data["data"], encryption_key
        )

    def restore_flagged(self, dir, data, encryption_key):
        return self.restore_flagged_file(dir, data, encryption_key)

    def generate_sample(self):
        return deepcopy(media_data.BASE64_VIDEO)

    def postprocess(self, y):
        """
        Parameters:
        y (str): path to video
        Returns:
        (str): base64 url data
        """
        if y is None:
            return None
        returned_format = y.split(".")[-1].lower()
        if self.format is not None and returned_format != self.format:
            output_file_name = y[0 : y.rindex(".") + 1] + self.format
            ff = FFmpeg(inputs={y: None}, outputs={output_file_name: None})
            ff.run()
            y = output_file_name
        return {
            "name": os.path.basename(y),
            "data": processing_utils.encode_file_to_base64(y),
        }

    def deserialize(self, x):
        file = processing_utils.decode_base64_to_file(x["data"])
        return file.name

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        height: Optional[int] = None,
        width: Optional[int] = None,
    ):
        self._style["height"] = height
        self._style["width"] = width
        return IOComponent.style(
            self,
            rounded=rounded,
        )


class Audio(Changeable, Clearable, Playable, Streamable, IOComponent):
    """
    Creates an audio component that can be used to upload/record audio (as an input) or display audio (as an output).
    Preprocessing: passes the uploaded audio as a {Tuple(int, numpy.array)} corresponding to (sample rate, data) or as a {str} filepath, depending on `type`
    Postprocessing: expects a {Tuple(int, numpy.array)} corresponding to (sample rate, data) or as a {str} filepath to an audio file, which gets displayed

    Demos: main_note, generate_tone, reverse_audio
    """

    def __init__(
        self,
        value: Optional[str | Tuple[int, np.array]] = None,
        *,
        source: str = "upload",
        type: str = "numpy",
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        streaming: bool = False,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (str | Tuple[int, numpy.array]): A path, URL, or [sample_rate, numpy array] tuple for the default value that Audio component is going to take.
        source (str): Source of audio. "upload" creates a box where user can drop an audio file, "microphone" creates a microphone input.
        type (str): The format the audio file is converted to before being passed into the prediction function. "numpy" converts the audio to a tuple consisting of: (int sample rate, numpy.array for the data), "filepath" passes a str path to a temporary file containing the audio.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, will allow users to upload and edit a audio file; if False, can only be used to play audio. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        streaming (bool): If set to true when used in a `live` interface, will automatically stream webcam feed. Only valid is source is 'microphone'.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.value = self.postprocess(value)
        self.source = source
        requires_permissions = source == "microphone"
        self.type = type
        self.test_input = deepcopy(media_data.BASE64_AUDIO)
        self.interpret_by_tokens = True
        self.streaming = streaming
        if streaming and source != "microphone":
            raise ValueError(
                "Audio streaming only available if source is 'microphone'."
            )
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            requires_permissions=requires_permissions,
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
        value: Optional[Any] = None,
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

    def preprocess_example(self, x):
        return {"name": x, "data": None, "is_example": True}

    def preprocess(self, x: Dict[str, str] | None) -> Tuple[int, np.array] | str | None:
        """
        Parameters:
        x (Dict[name: str, data: str]): JSON object with filename as 'name' property and base64 data as 'data' property
        Returns:
        (Tuple[int, numpy.array] | str): audio in requested format
        """
        if x is None:
            return x
        file_name, file_data, is_example = (
            x["name"],
            x["data"],
            x.get("is_example", False),
        )
        crop_min, crop_max = x.get("crop_min", 0), x.get("crop_max", 100)
        if is_example:
            file_obj = processing_utils.create_tmp_copy_of_file(file_name)
        else:
            file_obj = processing_utils.decode_base64_to_file(
                file_data, file_path=file_name
            )
        if crop_min != 0 or crop_max != 100:
            sample_rate, data = processing_utils.audio_from_file(
                file_obj.name, crop_min=crop_min, crop_max=crop_max
            )
            processing_utils.audio_to_file(sample_rate, data, file_obj.name)
        if self.type == "file":
            warnings.warn(
                "The 'file' type has been deprecated. Set parameter 'type' to 'filepath' instead.",
                DeprecationWarning,
            )
            return file_obj
        elif self.type == "filepath":
            return file_obj.name
        elif self.type == "numpy":
            return processing_utils.audio_from_file(file_obj.name)
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'numpy', 'filepath'."
            )

    def serialize(self, x, called_directly):
        if x is None:
            return None
        if self.type == "filepath" or called_directly:
            name = x
        elif self.type == "file":
            warnings.warn(
                "The 'file' type has been deprecated. Set parameter 'type' to 'filepath' instead.",
                DeprecationWarning,
            )
            name = x.name
        elif self.type == "numpy":
            file = tempfile.NamedTemporaryFile(delete=False)
            name = file.name
            processing_utils.audio_to_file(x[0], x[1], name)
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'numpy', 'filepath'."
            )

        file_data = processing_utils.encode_url_or_file_to_base64(name)
        return {"name": name, "data": file_data, "is_example": False}

    def set_interpret_parameters(self, segments=8):
        """
        Calculates interpretation score of audio subsections by splitting the audio into subsections, then using a "leave one out" method to calculate the score of each subsection by removing the subsection and measuring the delta of the output value.
        Parameters:
        segments (int): Number of interpretation segments to split audio into.
        """
        self.interpretation_segments = segments
        return self

    def tokenize(self, x):
        if x.get("is_example"):
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

    def get_interpretation_scores(self, x, neighbors, scores, masks=None, tokens=None):
        """
        Returns:
        (List[float]): Each value represents the interpretation score corresponding to an evenly spaced subsection of audio.
        """
        return list(scores)

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to audio file
        """
        if data is None:
            data_string = None
        elif isinstance(data, str):
            data_string = data
        else:
            data_string = data["data"]
            is_example = data.get("is_example", False)
            if is_example:
                file_obj = processing_utils.create_tmp_copy_of_file(data["name"])
                return self.save_file(file_obj, dir, label)
        return self.save_flagged_file(dir, label, data_string, encryption_key)

    def restore_flagged(self, dir, data, encryption_key):
        return self.restore_flagged_file(dir, data, encryption_key)

    def generate_sample(self):
        return deepcopy(media_data.BASE64_AUDIO)

    def postprocess(self, y):
        """
        Parameters:
        y (Tuple[int, numpy.array] | str): audio data in requested format
        Returns:
        (str): base64 url data
        """
        if y is None:
            return None
        if isinstance(y, tuple):
            sample_rate, data = y
            file = tempfile.NamedTemporaryFile(
                prefix="sample", suffix=".wav", delete=False
            )
            processing_utils.audio_to_file(sample_rate, data, file.name)
            y = file.name
        return processing_utils.encode_url_or_file_to_base64(y)

    def deserialize(self, x):
        file = processing_utils.decode_base64_to_file(x)
        return file.name

    def stream(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        _js: Optional[str] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        Returns: None
        """
        if self.source != "microphone":
            raise ValueError(
                "Audio streaming only available if source is 'microphone'."
            )
        Streamable.stream(self, fn, inputs, outputs, _js)

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
    ):
        return IOComponent.style(
            self,
            rounded=rounded,
        )


class File(Changeable, Clearable, IOComponent):
    """
    Creates a file component that allows uploading generic file (when used as an input) and or displaying generic files (output).
    Preprocessing: passes the uploaded file as a {file-object} or {List[file-object]} depending on `file_count` (or a {bytes}/{List{bytes}} depending on `type`)
    Postprocessing: expects function to return a {str} path to a file, or {List[str]} consisting of paths to files.

    Demos: zip_to_json, zip_two_files
    """

    def __init__(
        self,
        value: Optional[str | List[str]] = None,
        *,
        file_count: str = "single",
        type: str = "file",
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (Optional[str]): Default file to display, given as str file path
        file_count (str): if single, allows user to upload one file. If "multiple", user uploads multiple files. If "directory", user uploads all files in selected directory. Return type will be list for each file in case of "multiple" or "directory".
        type (str): Type of value to be returned by component. "file" returns a temporary file object whose path can be retrieved by file_obj.name, "binary" returns an bytes object.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, will allow users to upload a file; if False, can only be used to display files. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.file_count = file_count
        self.type = type
        self.value = self.postprocess(value)
        self.test_input = None
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "file_count": self.file_count,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def preprocess_example(self, x):
        if isinstance(x, list):
            return [
                {
                    "name": file,
                    "data": None,
                    "size": os.path.getsize(file),
                    "is_example": True,
                }
                for file in x
            ]
        else:
            return {
                "name": x,
                "data": None,
                "size": os.path.getsize(x),
                "is_example": True,
            }

    def preprocess(self, x: List[Dict[str, str]] | None):
        """
        Parameters:
        x (List[Dict[name: str, data: str]]): List of JSON objects with filename as 'name' property and base64 data as 'data' property
        Returns:
        (file-object | bytes | List[file-object] | List[bytes]]): File objects in requested format
        """
        if x is None:
            return None

        def process_single_file(f):
            file_name, data, is_example = (
                f["name"],
                f["data"],
                f.get("is_example", False),
            )
            if self.type == "file":
                if is_example:
                    return processing_utils.create_tmp_copy_of_file(file_name)
                else:
                    return processing_utils.decode_base64_to_file(
                        data, file_path=file_name
                    )
            elif self.type == "bytes":
                if is_example:
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
            return [process_single_file(f) for f in x]

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to file
        """
        if isinstance(data, list):
            return self.save_flagged_file(
                dir, label, None if data is None else data[0]["data"], encryption_key
            )
        else:
            return self.save_flagged_file(
                dir, label, data["data"], encryption_key, data["name"]
            )

    def generate_sample(self):
        return deepcopy(media_data.BASE64_FILE)

    # Output Functionalities

    def postprocess(self, y):
        """
        Parameters:
        y (str): file path
        Returns:
        (Dict[name: str, size: number, data: str]): JSON object with key 'name' for filename, 'data' for base64 url, and 'size' for filesize in bytes
        """
        if y is None:
            return None
        if isinstance(y, list):
            return [
                {
                    "name": os.path.basename(file),
                    "size": os.path.getsize(file),
                    "data": processing_utils.encode_file_to_base64(file),
                }
                for file in y
            ]
        else:
            return {
                "name": os.path.basename(y),
                "size": os.path.getsize(y),
                "data": processing_utils.encode_file_to_base64(y),
            }

    def deserialize(self, x):
        file = processing_utils.decode_base64_to_file(x["data"])
        return file.name

    def restore_flagged(self, dir, data, encryption_key):
        return self.restore_flagged_file(dir, data, encryption_key)

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
    ):
        return IOComponent.style(
            self,
            rounded=rounded,
        )


class Dataframe(Changeable, IOComponent):
    """
    Accepts or displays 2D input through a spreadsheet-like component for dataframes.
    Preprocessing: passes the uploaded spreadsheet data as a {pandas.DataFrame}, {numpy.array}, {List[List]}, or {List} depending on `type`
    Postprocessing: expects a {pandas.DataFrame}, {numpy.array}, {List[List]}, {List}, or {str} path to a csv, which is rendered in the spreadsheet.

    Demos: filter_records, matrix_transpose, tax_calculator
    """

    def __init__(
        self,
        value: Optional[List[List[Any]]] = None,
        *,
        headers: Optional[List[str]] = None,
        row_count: int | Tuple[int, str] = (3, "dynamic"),
        col_count: Optional[int | Tuple[int, str]] = None,
        datatype: str | List[str] = "str",
        type: str = "pandas",
        max_rows: Optional[int] = 20,
        max_cols: Optional[int] = None,
        overflow_row_behaviour: str = "paginate",
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        wrap: bool = False,
        **kwargs,
    ):
        """
        Parameters:
        value (List[List[Any]]): Default value as a 2-dimensional list of values.
        headers (List[str] | None): List of str header names. If None, no headers are shown.
        row_count (int | Tuple[int, str]): Limit number of rows for input and decide whether user can create new rows. The first element of the tuple is an `int`, the row count; the second should be 'fixed' or 'dynamic', the new row behaviour. If an `int` is passed the rows default to 'dynamic'
        col_count (int | Tuple[int, str]): Limit number of columns for input and decide whether user can create new columns. The first element of the tuple is an `int`, the number of columns; the second should be 'fixed' or 'dynamic', the new column behaviour. If an `int` is passed the columns default to 'dynamic'
        datatype (str | List[str]): Datatype of values in sheet. Can be provided per column as a list of strings, or for the entire sheet as a single string. Valid datatypes are "str", "number", "bool", and "date".
        type (str): Type of value to be returned by component. "pandas" for pandas dataframe, "numpy" for numpy array, or "array" for a Python array.
        label (str): component name in interface.
        max_rows (int): Maximum number of rows to display at once. Set to None for infinite.
        max_cols (int): Maximum number of columns to display at once. Set to None for infinite.
        overflow_row_behaviour (str): If set to "paginate", will create pages for overflow rows. If set to "show_ends", will show initial and final rows and truncate middle rows.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, will allow users to edit the dataframe; if False, can only be used to display data. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        wrap (Optional[bool]): if True text in table cells will wrap when appropriate, if False the table will scroll horiztonally. Defaults to False.
        """

        self.wrap = wrap
        self.row_count = self.__process_counts(row_count)
        self.col_count = self.__process_counts(
            col_count, len(headers) if headers else 3
        )

        self.__validate_headers(headers, self.col_count[0])

        self.headers = headers
        self.datatype = datatype
        self.type = type
        values = {
            "str": "",
            "number": 0,
            "bool": False,
            "date": "01/01/1970",
        }
        column_dtypes = (
            [datatype] * self.col_count[0] if isinstance(datatype, str) else datatype
        )
        self.test_input = [
            [values[c] for c in column_dtypes] for _ in range(self.row_count[0])
        ]
        self.value = value if value is not None else self.test_input
        self.max_rows = max_rows
        self.max_cols = max_cols
        self.overflow_row_behaviour = overflow_row_behaviour
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[Any] = None,
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

    def preprocess(self, x: List[List[str | Number | bool]]):
        """
        Parameters:
        x (List[List[str | number | bool]]): 2D array of str, numeric, or bool data
        Returns:
        (pandas.DataFrame | numpy.array | List[str | float | bool], List[List[str | float | bool]]): Dataframe in requested format
        """
        if self.type == "pandas":
            if self.headers:
                return pd.DataFrame(x, columns=self.headers)
            else:
                return pd.DataFrame(x)
        if self.col_count[0] == 1:
            x = [row[0] for row in x]
        if self.type == "numpy":
            return np.array(x)
        elif self.type == "array":
            return x
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'pandas', 'numpy', 'array'."
            )

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (List[List[str | float]]) 2D array
        """
        return json.dumps(data)
        # TODO: (faruk) output was dumping differently, how to converge?
        # return json.dumps(data["data"])

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)
        # TODO: (faruk) output was dumping differently, how to converge?
        # return {"data": json.loads(data)}

    def generate_sample(self):
        return [[1, 2, 3], [4, 5, 6]]

    def postprocess(self, y):
        """
        Parameters:
        y (str | pandas.DataFrame | numpy.array | List[str | float], List[List[str | float]]]): dataframe in given format
        Returns:
        (Dict[headers: List[str], data: List[List[str | number]]]): JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
        """
        if y is None:
            return y
        if isinstance(y, str):
            y = pd.read_csv(str)
            return {"headers": list(y.columns), "data": y.values.tolist()}
        if isinstance(y, pd.DataFrame):
            return {"headers": list(y.columns), "data": y.values.tolist()}
        if isinstance(y, (np.ndarray, list)):
            if isinstance(y, np.ndarray):
                y = y.tolist()
            if len(y) == 0 or not isinstance(y[0], list):
                y = [y]
            return {"data": y}
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

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        border: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
    ):
        return IOComponent.style(
            self,
            rounded=rounded,
        )


class Timeseries(Changeable, IOComponent):
    """
    Creates a component that can be used to upload/preview timeseries csv files or display a dataframe consisting of a time series graphically.
    Preprocessing: passes the uploaded timeseries data as a {pandas.DataFrame} into the function
    Postprocessing: expects a {pandas.DataFrame} or {str} path to a csv to be returned, which is then displayed as a timeseries graph

    Demos: fraud_detector
    """

    def __init__(
        self,
        value: Optional[str] = None,
        *,
        x: Optional[str] = None,
        y: str | List[str] = None,
        colors: List[str] = None,
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value: File path for the timeseries csv file.
        x (str): Column name of x (time) series. None if csv has no headers, in which case first column is x series.
        y (str | List[str]): Column name of y series, or list of column names if multiple series. None if csv has no headers, in which case every column after first is a y series.
        label (str): component name in interface.
        colors (List[str]): an ordered list of colors to use for each line plot
        show_label (bool): if True, will display label.
        interactive (Optional[bool]): if True, will allow users to upload a timeseries csv; if False, can only be used to display timeseries data. If not provided, this is inferred based on whether the component is used as an input or output.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.value = self.postprocess(value)
        self.x = x
        if isinstance(y, str):
            y = [y]
        self.y = y
        self.colors = colors
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[Any] = None,
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

    def preprocess_example(self, x):
        return {"name": x, "is_example": True}

    def preprocess(self, x: Dict | None) -> pd.DataFrame | None:
        """
        Parameters:
        x (Dict[data: List[List[str | number | bool]], headers: List[str], range: List[number]]): Dict with keys 'data': 2D array of str, numeric, or bool data, 'headers': list of strings for header names, 'range': optional two element list designating start of end of subrange.
        Returns:
        (pandas.DataFrame): Dataframe of timeseries data
        """
        if x is None:
            return x
        elif x.get("is_example"):
            dataframe = pd.read_csv(x["name"])
        else:
            dataframe = pd.DataFrame(data=x["data"], columns=x["headers"])
        if x.get("range") is not None:
            dataframe = dataframe.loc[dataframe[self.x or 0] >= x["range"][0]]
            dataframe = dataframe.loc[dataframe[self.x or 0] <= x["range"][1]]
        return dataframe

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (List[List[str | float]]) 2D array
        """
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)

    def generate_sample(self):
        return {"data": [[1] + [2] * len(self.y)] * 4, "headers": [self.x] + self.y}

    # Output Functionalities

    def postprocess(self, y):
        """
        Parameters:
        y (str | pandas.DataFrame): csv or dataframe with timeseries data
        Returns:
        (Dict[headers: List[str], data: List[List[str | number]]]): JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
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
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        border: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
    ):
        return IOComponent.style(
            self,
            rounded=rounded,
        )


class Variable(IOComponent):
    """
    Special hidden component that stores session state across runs of the demo by the
    same user. The value of the Variable is cleared when the user refreshes the page.

    Preprocessing: No preprocessing is performed
    Postprocessing: No postprocessing is performed
    Demos: chatbot_demo, blocks_simple_squares
    """

    def __init__(
        self,
        value: Any = None,
        **kwargs,
    ):
        """
        Parameters:
        value (Any): the initial value of the state.
        """
        self.value = deepcopy(value)
        self.stateful = True
        IOComponent.__init__(self, **kwargs)

    def style(self):
        return self


class Button(Clickable, IOComponent):
    """
    Used to create a button, that can be assigned arbitrary click() events. The label (value) of the button can be used as an input or set via the output of a function.
    Preprocessing: passes the button value as a {str} into the function
    Postprocessing: expects a {str} to be returned from a function, which is set as the label of the button

    Demos: blocks_inputs, blocks_kinematics
    """

    def __init__(
        self,
        value: str = "Run",
        *,
        variant: str = "secondary",
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (str): Default value
        variant (str): 'primary' for main call-to-action, 'secondary' for a more subdued style
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        Component.__init__(self, visible=visible, elem_id=elem_id, **kwargs)
        self.value = value
        self.variant = variant

    def get_config(self):
        return {
            "value": self.value,
            "variant": self.variant,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
        variant: Optional[str] = None,
        visible: Optional[bool] = None,
    ):
        return {
            "variant": variant,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        full_width: Optional[str] = None,
        border: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        margin: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
    ):
        if full_width is not None:
            self._style["full_width"] = full_width
        if margin is not None:
            self._style["margin"] = margin

        return IOComponent.style(
            self,
            rounded=rounded,
            border=border,
        )


############################
# Only Output Components
############################


class Label(Changeable, IOComponent):
    """
    Displays a classification label, along with confidence scores of top categories, if provided.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {Dict[str, float]} of classes and confidences, or {str} with just the class or an {int}/{float} for regression outputs.

    Demos: image_classifier, main_note, titanic_survival
    """

    CONFIDENCES_KEY = "confidences"

    def __init__(
        self,
        value: Optional[str] = None,
        *,
        num_top_classes: Optional[int] = None,
        label: Optional[str] = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value(str): Default value to show in the component.
        num_top_classes (int): number of most confident classes to show.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.num_top_classes = num_top_classes
        self.value = self.postprocess(value)
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "num_top_classes": self.num_top_classes,
            "value": self.value,
            **IOComponent.get_config(self),
        }

    def postprocess(self, y):
        """
        Parameters:
        y (Dict[str, float] | str | Number): a dictionary mapping labels to confidence value, or just a string/numerical label by itself
        Returns:
        (Dict[label: str, confidences: List[Dict[label: str, confidence: number]]]): Object with key 'label' representing primary label, and key 'confidences' representing a list of label-confidence pairs
        """
        if y is None or y == {}:
            return None
        if isinstance(y, (str, numbers.Number)):
            return {"label": str(y)}
        if isinstance(y, dict):
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

    def deserialize(self, y):
        if y is None:
            return None
        # 5 cases: (1): {'label': 'lion'}, {'label': 'lion', 'confidences':...}, {'lion': 0.46, ...}, 'lion', '0.46'
        if isinstance(y, (str, numbers.Number)) or (
            "label" in y and not ("confidences" in y.keys())
        ):
            if isinstance(y, (str, numbers.Number)):
                return y
            else:
                return y["label"]
        if ("confidences" in y.keys()) and isinstance(y["confidences"], list):
            return {k["label"]: k["confidence"] for k in y["confidences"]}
        else:
            return y

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str | Dict[str, number]): Either a string representing the main category label, or a dictionary with category keys mapping to confidence levels.
        """
        if "confidences" in data:
            return json.dumps(
                {
                    example["label"]: example["confidence"]
                    for example in data["confidences"]
                }
            )
        else:
            return data["label"]

    def restore_flagged(self, dir, data, encryption_key):
        try:
            data = json.loads(data)
            return self.postprocess(data)
        except ValueError:
            return data

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def style(
        self,
        container: Optional[bool] = None,
    ):
        return IOComponent.style(self, container=container)


class HighlightedText(Changeable, IOComponent):
    """
    Displays text that contains spans that are highlighted by category or numerical value.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {List[Tuple[str, float | str]]]} consisting of spans of text and their associated labels.

    Demos: diff_texts, text_analysis
    """

    def __init__(
        self,
        value: Optional[str] = None,
        *,
        color_map: Dict[str, str] = None,  # Parameter moved to HighlightedText.style()
        show_legend: bool = False,
        combine_adjacent: bool = False,
        adjacent_separator: str = "",
        label: Optional[str] = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (List[Tuple[str, str | Number | None]]): Default value to show.
        show_legend (bool): whether to show span categories in a separate legend or inline.
        combine_adjacent (bool): If True, will merge the labels of adjacent tokens belonging to the same category.
        adjacent_separator (str): Specifies the separator to be used between tokens if combine_adjacent is True.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.color_map = color_map
        if color_map is not None:
            warnings.warn(
                "The 'color_map' parameter has been moved from the constructor to `HighlightedText.style()` ",
                DeprecationWarning,
            )
        self.show_legend = show_legend
        self.combine_adjacent = combine_adjacent
        self.adjacent_separator = adjacent_separator
        self.value = self.postprocess(value)
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[Any] = None,
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

    def postprocess(self, y):
        """
        Parameters:
        y (List[Tuple[str, str | number | None]]): List of (word, category) tuples
        Returns:
        (List[Tuple[str, str | number | None]]): List of (word, category) tuples
        """
        if y is None:
            return None
        if self.combine_adjacent:
            output = []
            running_text, running_category = None, None
            for text, category in y:
                if running_text is None:
                    running_text = text
                    running_category = category
                elif category == running_category:
                    running_text += self.adjacent_separator + text
                else:
                    output.append((running_text, running_category))
                    running_text = text
                    running_category = category
            if running_text is not None:
                output.append((running_text, running_category))
            return output
        else:
            return y

    def save_flagged(self, dir, label, data, encryption_key):
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        color_map: Optional[Dict[str, str]] = None,
        container: Optional[bool] = None,
    ):
        """
        Parameters:
        rounded (bool | Tuple[bool, bool, bool, bool]): If True, will round the corners of the text. If a tuple, will round the corners of the text according to the values in the tuple, starting from top left and proceeding clock-wise.
        color_map (Dict[str, str]): Map between category and respective colors.
        container (bool): If True, will place the component in a container.
        """
        if color_map is not None:
            self._style["color_map"] = color_map

        return IOComponent.style(self, rounded=rounded, container=container)


class JSON(Changeable, IOComponent):
    """
    Used to display arbitrary JSON output prettily.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a valid JSON {str} -- or a {list} or {dict} that is JSON serializable.

    Demos: zip_to_json, blocks_xray
    """

    def __init__(
        self,
        value: Optional[str] = None,
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (str): Default value
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.value = self.postprocess(value)
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def postprocess(self, y):
        """
        Parameters:
        y (Dict | List | str]): JSON output
        Returns:
        (Dict | List): JSON output
        """
        if isinstance(y, str):
            return json.dumps(y)
        else:
            return y

    def save_flagged(self, dir, label, data, encryption_key):
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)

    def style(self, container: Optional[bool] = None):
        return IOComponent.style(self, container=container)


class HTML(Changeable, IOComponent):
    """
    Used to display arbitrary HTML output.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a valid HTML {str}.

    Demos: text_analysis
    """

    def __init__(
        self,
        value: str = "",
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (str): Default value
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.value = value
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
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


class Gallery(IOComponent):
    """
    Used to display a list of images as a gallery that can be scrolled through.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a list of images in any format, {List[numpy.array | PIL.Image | str]}, and displays them.

    Demos: fake_gan
    """

    def __init__(
        self,
        value: Optional[List[np.ndarray | PIL.Image | str]] = None,
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (Optional[List[np.ndarray | PIL.Image | str]]): List of images to display in the gallery by default
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.value = self.postprocess(value)
        super().__init__(
            label=label,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def postprocess(self, y):
        """
        Parameters:
        y (List[numpy.array | PIL.Image | str]): list of images
        Returns:
        (str): list of base64 url data for images
        """
        if y is None:
            return []
        output = []
        for img in y:
            if isinstance(img, np.ndarray):
                img = processing_utils.encode_array_to_base64(img)
            elif isinstance(img, PIL.Image.Image):
                img = np.array(img)
                img = processing_utils.encode_array_to_base64(img)
            elif isinstance(img, str):
                img = processing_utils.encode_url_or_file_to_base64(img)
            else:
                raise ValueError(
                    "Unknown type. Please choose from: 'numpy', 'pil', 'file'."
                )
            output.append(img)
        return output

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        grid: Optional[int | Tuple[int, int, int, int, int, int]] = None,
        height: Optional[str] = None,
        container: Optional[bool] = None,
    ):
        if grid is not None:
            self._style["grid"] = grid
        if height is not None:
            self._style["height"] = height

        return IOComponent.style(self, rounded=rounded, container=container)


class Carousel(IOComponent, Changeable):
    """
    Component displays a set of output components that can be scrolled through.
    Output type: List[List[Any]]
    Demos: disease_report
    """

    def __init__(
        self,
        *,
        components: Component | List[Component],
        label: Optional[str] = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        components (List[Component] | Component): Classes of component(s) that will be scrolled through.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        warnings.warn(
            "The Carousel component is partially deprecated. It may not behave as expected.",
            DeprecationWarning,
        )
        if not isinstance(components, list):
            components = [components]
        self.components = [
            get_component_instance(component) for component in components
        ]
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "components": [component.get_config() for component in self.components],
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def postprocess(self, y):
        """
        Parameters:
        y (List[List[Any]]): carousel output
        Returns:
        (List[List[Any]]): 2D array, where each sublist represents one set of outputs or 'slide' in the carousel
        """
        if isinstance(y, list):
            if len(y) != 0 and not isinstance(y[0], list):
                y = [[z] for z in y]
            output = []
            for row in y:
                output_row = []
                for i, cell in enumerate(row):
                    output_row.append(self.components[i].postprocess(cell))
                output.append(output_row)
            return output
        else:
            raise ValueError("Unknown type. Please provide a list for the Carousel.")

    def save_flagged(self, dir, label, data, encryption_key):
        return json.dumps(
            [
                [
                    component.save_flagged(
                        dir, f"{label}_{j}", data[i][j], encryption_key
                    )
                    for j, component in enumerate(self.components)
                ]
                for i, _ in enumerate(data)
            ]
        )

    def restore_flagged(self, dir, data, encryption_key):
        return [
            [
                component.restore_flagged(dir, sample, encryption_key)
                for component, sample in zip(self.components, sample_set)
            ]
            for sample_set in json.loads(data)
        ]


class Chatbot(Changeable, IOComponent):
    """
    Displays a chatbot output showing both user submitted messages and responses
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a {List[Tuple[str, str]]}, a list of tuples with user inputs and responses.

    Demos: chatbot_demo
    """

    def __init__(
        self,
        value: Optional[List[Tuple[str, str]]] = None,
        color_map: Dict[str, str] = None,  # Parameter moved to Chatbot.style()
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (str): Default value to show in chatbot
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        if color_map is not None:
            warnings.warn(
                "The 'color_map' parameter has been moved from the constructor to `Chatbot.style()` ",
                DeprecationWarning,
            )

        self.value = self.postprocess(value)
        self.color_map = color_map

        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[Any] = None,
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

    def postprocess(self, y):
        """
        Parameters:
        y (List[Tuple[str, str]]): List of tuples representing the message and response
        Returns:
        (List[Tuple[str, str]]): Returns same list of tuples

        """
        return y

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        color_map: Optional[Dict[str, str]] = None,
    ):
        if color_map is not None:
            self._style["color_map"] = color_map

        return IOComponent.style(
            self,
            rounded=rounded,
        )


class Model3D(Changeable, Editable, Clearable, IOComponent):
    """
    Component allows users to upload or view 3D Model files (.obj, .glb, or .gltf).
    Preprocessing: This component passes the uploaded file as a {str} filepath.
    Postprocessing: expects function to return a {str} path to a file of type (.obj, glb, or .gltf)

    Demos: model3D
    """

    def __init__(
        self,
        value: Optional[str] = None,
        *,
        clear_color: List[float] = None,
        label: Optional[str] = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (Optional[str]): path to (.obj, glb, or .gltf) file to show in model3D viewer
        clear_color (List[r, g, b, a]): background color of scene
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.clear_color = clear_color or [0.2, 0.2, 0.2, 1.0]
        self.value = self.postprocess(value)
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
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
        value: Optional[Any] = None,
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

    def preprocess_example(self, x):
        return {"name": x, "data": None, "is_example": True}

    def preprocess(self, x: Dict[str, str] | None) -> str | None:
        """
        Parameters:
        x (Dict[name: str, data: str]): JSON object with filename as 'name' property and base64 data as 'data' property
        Returns:
        (str): file path to 3D image model
        """
        if x is None:
            return x
        file_name, file_data, is_example = (
            x["name"],
            x["data"],
            x.get("is_example", False),
        )
        if is_example:
            file = processing_utils.create_tmp_copy_of_file(file_name)
        else:
            file = processing_utils.decode_base64_to_file(
                file_data, file_path=file_name
            )
        file_name = file.name
        return file_name

    def serialize(self, x, called_directly):
        raise NotImplementedError()

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to 3D image model file
        """
        return self.save_flagged_file(
            dir, label, data["data"], encryption_key, data["name"]
        )

    def generate_sample(self):
        return media_data.BASE64_MODEL3D

    # Output functions

    def postprocess(self, y):
        """
        Parameters:
        y (str): path to the model
        Returns:
        (Dict[name (str): file name, data (str): base64 url data] | None)
        """
        if y is None:
            return y
        data = {
            "name": os.path.basename(y),
            "data": processing_utils.encode_file_to_base64(y),
        }
        return data

    def deserialize(self, x):
        file = processing_utils.decode_base64_to_file(x["data"], file_path=x["name"])
        return file.name

    def restore_flagged(self, dir, data, encryption_key):
        return self.restore_flagged_file(dir, data, encryption_key, as_data=True)

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
    ):
        return IOComponent.style(
            self,
            rounded=rounded,
        )


class Plot(Changeable, Clearable, IOComponent):
    """
    Used to display various kinds of plots (matplotlib, plotly, or bokeh are supported)
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects either a {matplotlib.figure.Figure}, a {plotly.graph_objects._figure.Figure}, or a {dict} corresponding to a bokeh plot (json_item format)

    Demos: outbreak_forecast, blocks_kinematics, stock_forecast
    """

    def __init__(
        self,
        value=None,
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (Optional[matplotlib.figure.Figure | dict | plotly.graph_objects._figure.Figure]): Optionally, supply a default plot object to display, must be a matplotlib, plotly, or bokeh figure.
        label (Optional[str]): component name in interface.
        show_label (bool): if True, will display label.
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.value = self.postprocess(value)
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {"value": self.value, **IOComponent.get_config(self)}

    @staticmethod
    def update(
        value: Optional[Any] = None,
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

    def postprocess(self, y):
        """
        Parameters:
        y (str): plot data
        Returns:
        (Dict[type (str): plot type, plot (str): plot base64 | json] | None)
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
            dtype = "plotly"
            out_y = y.to_json()
        return {"type": dtype, "plot": out_y}

    def style(self):
        return self

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (List[str]])
        """
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)


class Markdown(IOComponent, Changeable):
    """
    Used to render arbitrary Markdown output.
    Preprocessing: this component does *not* accept input.
    Postprocessing: expects a valid {str} that can be rendered as Markdown.

    Demos: blocks_hello, blocks_kinematics
    """

    def __init__(
        self,
        value: str = "",
        *,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        value (str): Value to show in Markdown component
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        IOComponent.__init__(self, visible=visible, elem_id=elem_id, **kwargs)
        self.md = MarkdownIt()
        self.value = self.postprocess(value)

    def postprocess(self, y):
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
        value: Optional[Any] = None,
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


############################
# Static Components
############################


class Dataset(Clickable, Component):
    """
    Used to create a output widget for showing datasets. Used to render the examples
    box in the interface.
    """

    def __init__(
        self,
        *,
        components: List[Component] | List[str],
        samples: List[List[Any]],
        headers: Optional[List[str]] = None,
        type: str = "values",
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        components (List[Component]): Which component types to show in this dataset widget, can be passed in as a list of string names or Components instances
        samples (str): a nested list of samples. Each sublist within the outer list represents a data sample, and each element within the sublist represents an value for each component
        headers (List[str]): Column headers in the Dataset widget, should be the same len as components. If not provided, inferred from component labels
        type (str): 'values' if clicking on a sample should pass the value of the sample, or "index" if it should pass the index of the sample
        visible (bool): If False, component will be hidden.
        elem_id (Optional[str]): An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        Component.__init__(self, visible=visible, elem_id=elem_id, **kwargs)
        self.components = [get_component_instance(c, render=False) for c in components]
        self.type = type
        self.headers = headers or [c.label for c in self.components]
        self.samples = samples

    def get_config(self):
        return {
            "components": [component.get_block_name() for component in self.components],
            "headers": self.headers,
            "samples": self.samples,
            "type": self.type,
            **Component.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
        visible: Optional[bool] = None,
    ):
        return {
            "visible": visible,
            "value": value,
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

    def style(
        self,
        rounded: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
        border: Optional[bool | Tuple[bool, bool, bool, bool]] = None,
    ):
        return IOComponent.style(
            self,
            rounded=rounded,
            border=border,
        )


class Interpretation(Component):
    """
    Used to create an interpretation widget for a component.
    """

    def __init__(
        self,
        component: Component,
        *,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        Component.__init__(self, visible=visible, elem_id=elem_id, **kwargs)
        self.component = component

    def get_config(self):
        return {
            "component": self.component.get_block_name(),
            "component_props": self.component.get_config(),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
        visible: Optional[bool] = None,
    ):
        return {
            "visible": visible,
            "value": value,
            "__type__": "update",
        }

    def style(self):
        return self

    def postprocess(self, y):
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
        cover_container (bool): If True, will expand to cover parent container while function pending.
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
        value: Optional[Any] = None,
        visible: Optional[bool] = None,
    ):
        return {
            "visible": visible,
            "value": value,
            "__type__": "update",
        }


def component(cls_name: str) -> Component:
    obj = component_or_layout_class(cls_name)()
    return obj


def get_component_instance(comp: str | dict | Component, render=True) -> Component:
    if isinstance(comp, str):
        component_obj = component(comp)
        if not (render):
            component_obj.unrender()
        return component_obj
    elif isinstance(comp, dict):
        name = comp.pop("name")
        component_cls = component_or_layout_class(name)
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


DataFrame = Dataframe
Highlightedtext = HighlightedText
Checkboxgroup = CheckboxGroup
TimeSeries = Timeseries
Json = JSON
