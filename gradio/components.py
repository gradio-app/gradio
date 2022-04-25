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


class Component(Block):
    """
    A base class for defining the methods that all gradio components should have.
    """

    def __init__(
        self,
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        requires_permissions: bool = False,
        css: Optional[Dict] = None,
        without_rendering: bool = False,
        interactive: Optional[bool] = None,
        **kwargs,
    ):
        if "optional" in kwargs:
            warnings.warn(
                "Usage of optional is deprecated, and it has no effect",
                DeprecationWarning,
            )
        self.label = label
        self.show_label = show_label 
        self.requires_permissions = requires_permissions
        self.interactive = interactive

        self.set_interpret_parameters()
        super().__init__(without_rendering=without_rendering, css=css)

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return f"{self.get_block_name()} (label={self.label})"

    def get_template_context(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {
            "name": self.get_block_name(),
            "label": self.label,
            "show_label": self.show_label,
            "css": self.css,
            "interactive": self.interactive,
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

    def restore_flagged_file(
        self,
        dir: str,
        file: str,
        encryption_key: bool,
    ) -> Dict[str, Any]:
        """
        Loads flagged data from file and returns it
        """
        data = processing_utils.encode_file_to_base64(
            os.path.join(dir, file), encryption_key=encryption_key
        )
        return {"name": file, "data": data}

    @classmethod
    def get_component_shortcut(cls, str_shortcut: str) -> Optional[Component]:
        """
        Creates a component, where class name equals to str_shortcut.

        @param str_shortcut: string shortcut of a component
        @return: the insantiated component object, or None if no such component exists
        """
        # If we do not import templates Python cannot recognize grandchild classes names.
        import gradio.templates

        # Make it suitable with class names
        str_shortcut = str_shortcut.replace("_", "")
        for sub_cls in cls.__subclasses__():
            if sub_cls.__name__.lower() == str_shortcut:
                return sub_cls()
            # For template components
            for sub_sub_cls in sub_cls.__subclasses__():
                if sub_sub_cls.__name__.lower() == str_shortcut:
                    return sub_sub_cls()
        return None

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

    @staticmethod
    def update(**kwargs) -> dict:
        """
        Updates component parameters

        @param kwargs: Updating component parameters
        @return: Updated component parameters
        """
        kwargs["__type__"] = "update"
        return kwargs


class Textbox(Component):
    """
    Component creates a textbox for user to enter string input or display string output. Provides a string as an argument to the wrapped function.
    Input type: str
    Output type: str

    Demos: hello_world, diff_texts, sentence_builder
    """

    def __init__(
        self,
        default_value: str = "",
        *,
        lines: int = 1,
        max_lines: int = 20,
        placeholder: Optional[str] = None,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): default text to provide in textarea.
        lines (int): minimum number of line rows to provide in textarea.
        max_lines (int): maximum number of line rows to provide in textarea.
        placeholder (str): placeholder hint to provide behind textarea.
        label (str): component name in interface.
        """
        if "numeric" in kwargs:
            warnings.warn(
                "The 'numeric' type has been deprecated. Use the Number component instead.",
                DeprecationWarning,
            )
        if "type" in kwargs:
            warnings.warn(
                "The 'type' parameter has been deprecated. Use the Number component instead if you need it.",
                DeprecationWarning,
            )
        default_value = str(default_value)
        self.lines = lines
        self.max_lines = max_lines
        self.placeholder = placeholder
        self.default_value = default_value
        self.test_input = default_value
        self.interpret_by_tokens = True
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "lines": self.lines,
            "max_lines": self.max_lines,
            "placeholder": self.placeholder,
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    # Input Functionalities
    def preprocess(self, x: str | None) -> Any:
        """
        Any preprocessing needed to be performed on function input.
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

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )

    def submit(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "submit", fn, inputs, outputs, status_tracker=status_tracker
        )


class Number(Component):
    """
    Component creates a field for user to enter numeric input or display numeric output. Provides a number as an argument to the wrapped function.
    Can be used as an output as well.

    Input type: float
    Output type: float
    Demos: tax_calculator, titanic_survival
    """

    def __init__(
        self,
        default_value: Optional[float] = None,
        *,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (float): default value.
        label (str): component name in interface.
        """
        self.default_value = float(default_value) if default_value is not None else None
        self.test_input = self.default_value if self.default_value is not None else 1
        self.interpret_by_tokens = False
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {"default_value": self.default_value, **super().get_template_context()}

    def preprocess(self, x: float | None) -> Optional[float]:
        """
        Parameters:
        x (string): numeric input as a string
        Returns:
        (float): number representing function input
        """
        if x is None:
            return None
        return float(x)

    def preprocess_example(self, x: float | None) -> float | None:
        """
        Returns:
        (float): Number representing function input
        """
        if x is None:
            return None
        else:
            return float(x)

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

    def get_interpretation_neighbors(self, x: float) -> Tuple[List[float], Dict]:
        x = float(x)
        if self.interpretation_delta_type == "percent":
            delta = 1.0 * self.interpretation_delta * x / 100
        elif self.interpretation_delta_type == "absolute":
            delta = self.interpretation_delta
        else:
            delta = self.interpretation_delta
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
        return 1.0

    # Output Functionalities
    def postprocess(self, y: float | None):
        """
        Any postprocessing needed to be performed on function output.
        """
        if y is None:
            return None
        else:
            return float(y)

    def deserialize(self, y):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return y

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )

    def submit(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "submit", fn, inputs, outputs, status_tracker=status_tracker
        )


class Slider(Component):
    """
    Component creates a slider that ranges from `minimum` to `maximum`. Provides a number as an argument to the wrapped function.

    Input type: float
    Demos: sentence_builder, generate_tone, titanic_survival
    """

    def __init__(
        self,
        default_value: Optional[float] = None,
        *,
        minimum: float = 0,
        maximum: float = 100,
        step: Optional[float] = None,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (float): default value.
        minimum (float): minimum value for slider.
        maximum (float): maximum value for slider.
        step (float): increment between slider values.
        label (str): component name in interface.
        """
        self.minimum = minimum
        self.maximum = maximum
        if step is None:
            difference = maximum - minimum
            power = math.floor(math.log10(difference) - 2)
            step = 10**power
        self.step = step
        self.default_value = minimum if default_value is None else default_value
        self.test_input = self.default_value
        self.interpret_by_tokens = False
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "minimum": self.minimum,
            "maximum": self.maximum,
            "step": self.step,
            "default_value": self.default_value,
            **super().get_template_context(),
        }

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
        """
        return y

    def deserialize(self, y):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return y

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class Checkbox(Component):
    """
    Component creates a checkbox that can be set to `True` or `False`. Provides a boolean as an argument to the wrapped function.

    Input type: bool
    Output type: bool
    Demos: sentence_builder, titanic_survival
    """

    def __init__(
        self,
        default_value: bool = False,
        *,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (bool): if True, checked by default.
        label (str): component name in interface.
        """
        self.test_input = True
        self.default_value = default_value
        self.interpret_by_tokens = False
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {"default_value": self.default_value, **super().get_template_context()}

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
        """
        return y

    def deserialize(self, x):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return x

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class CheckboxGroup(Component):
    """
    Component creates a set of checkboxes of which a subset can be selected. Provides a list of strings representing the selected choices as an argument to the wrapped function.

    Input type: Union[List[str], List[int]]
    Demos: sentence_builder, titanic_survival, fraud_detector
    """

    def __init__(
        self,
        choices: List[str],
        *,
        default_selected: List[str] = None,
        type: str = "value",
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        default_selected (List[str]): default selected list of options.
        type (str): Type of value to be returned by component. "value" returns the list of strings of the choices selected, "index" returns the list of indicies of the choices selected.
        label (str): component name in interface.
        """
        if (
            default_selected is None
        ):  # Mutable parameters shall not be given as default parameters in the function.
            default_selected = []
        self.choices = choices
        self.default_value = default_selected
        self.type = type
        self.test_input = self.choices
        self.interpret_by_tokens = False
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "choices": self.choices,
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    def preprocess(self, x: List[str]) -> List[str] | List[int]:
        """
        Parameters:
        x (List[str]): list of selected choices
        Returns:
        (Union[List[str], List[int]]): list of selected choices as strings or indices within choice list
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
        """
        return y

    def deserialize(self, x):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return x

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class Radio(Component):
    """
    Component creates a set of radio buttons of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.

    Input type: Union[str, int]
    Demos: sentence_builder, tax_calculator, titanic_survival
    """

    def __init__(
        self,
        choices: List[str],
        *,
        default_selected: Optional[str] = None,
        type: str = "value",
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        default_selected (str): the button selected by default. If None, no button is selected by default.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        label (str): component name in interface.
        """
        self.choices = choices
        self.type = type
        self.test_input = self.choices[0]
        self.default_value = (
            default_selected if default_selected is not None else self.choices[0]
        )
        self.interpret_by_tokens = False
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "choices": self.choices,
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    def preprocess(self, x: str) -> str | int:
        """
        Parameters:
        x (str): selected choice
        Returns:
        (Union[str, int]): selected choice as string or index within choice list
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
        """
        return y

    def deserialize(self, x):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return x

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class Dropdown(Radio):
    """
    Component creates a dropdown of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.

    Input type: Union[str, int]
    Demos: sentence_builder, filter_records, titanic_survival
    """

    def __init__(
        self,
        choices: List[str],
        *,
        default_selected: Optional[str] = None,
        type: str = "value",
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        default_selected (str): default value selected in dropdown. If None, no value is selected by default.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        label (str): component name in interface.
        """
        # Everything is same with Dropdown and Radio, so let's make use of it :)
        super().__init__(
            default_selected=default_selected,
            choices=choices,
            type=type,
            label=label,
            **kwargs,
        )


class Image(Component):
    """
    Component creates an image component with input and output capabilities.

    Input type: Union[numpy.array, PIL.Image, file-object]
    Output type: Union[numpy.array, PIL.Image, str, matplotlib.pyplot, Tuple[Union[numpy.array, PIL.Image, str], List[Tuple[str, float, float, float, float]]]]
    Demos: image_classifier, image_mod, webcam, digit_classifier
    """

    def __init__(
        self,
        default_value: Optional[str] = None,
        *,
        shape: Tuple[int, int] = None,
        image_mode: str = "RGB",
        invert_colors: bool = False,
        source: str = "upload",
        tool: str = "editor",
        type: str = "numpy",
        label: str = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value(str): A path or URL for the default value that Image component is going to take.
        shape (Tuple[int, int]): (width, height) shape to crop and resize image to; if None, matches input image size.
        image_mode (str): "RGB" if color, or "L" if black and white.
        invert_colors (bool): whether to invert the image as a preprocessing step.
        source (str): Source of image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "canvas" defaults to a white image that can be edited and drawn upon with tools.
        tool (str): Tools used for editing. "editor" allows a full screen editor, "select" provides a cropping and zoom tool.
        type (str): The format the image is converted to before being passed into the prediction function. "numpy" converts the image to a numpy array with shape (width, height, 3) and values from 0 to 255, "pil" converts the image to a PIL image object, "file" produces a temporary file object whose path can be retrieved by file_obj.name, "filepath" returns the path directly.
        label (str): component name in interface.
        """
        if "plot" in kwargs:
            warnings.warn(
                "The 'plot' parameter has been deprecated. Use the new Plot() component instead",
                DeprecationWarning,
            )
            self.type = "plot"
        else:
            self.type = type

        self.default_value = (
            processing_utils.encode_url_or_file_to_base64(default_value)
            if default_value
            else None
        )
        self.type = type
        self.output_type = "auto"
        self.shape = shape
        self.image_mode = image_mode
        self.source = source
        requires_permissions = source == "webcam"
        self.tool = tool
        self.invert_colors = invert_colors
        self.test_input = deepcopy(media_data.BASE64_IMAGE)
        self.interpret_by_tokens = True
        super().__init__(
            label=label, requires_permissions=requires_permissions, **kwargs
        )

    def get_template_context(self):
        return {
            "image_mode": self.image_mode,
            "shape": self.shape,
            "source": self.source,
            "tool": self.tool,
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    def preprocess(self, x: Optional[str]) -> np.array | PIL.Image | str | None:
        """
        Parameters:
        x (str): base64 url data
        Returns:
        (Union[numpy.array, PIL.Image, filepath]): image in requested format
        """
        if x is None:
            return x
        im = processing_utils.decode_base64_to_image(x)
        fmt = im.format
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            im = im.convert(self.image_mode)
        if self.shape is not None:
            im = processing_utils.resize_and_crop(im, self.shape)
        if self.invert_colors:
            im = PIL.ImageOps.invert(im)
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
        return os.path.join(dir, data)

    def generate_sample(self):
        return deepcopy(media_data.BASE64_IMAGE)

    # Output functions

    def postprocess(self, y):
        """
        Parameters:
        y (Union[numpy.array, PIL.Image, str, matplotlib.pyplot, Tuple[Union[numpy.array, PIL.Image, str], List[Tuple[str, float, float, float, float]]]]): image in specified format
        Returns:
        (str): base64 url data
        """
        if self.output_type == "auto":
            if isinstance(y, np.ndarray):
                dtype = "numpy"
            elif isinstance(y, PIL.Image.Image):
                dtype = "pil"
            elif isinstance(y, str):
                dtype = "file"
            elif isinstance(y, (ModuleType, matplotlib.figure.Figure)):
                dtype = "plot"
            else:
                raise ValueError(
                    "Unknown type. Please choose from: 'numpy', 'pil', 'file', 'plot'."
                )
        else:
            dtype = self.output_type
        if dtype in ["numpy", "pil"]:
            if dtype == "pil":
                y = np.array(y)
            out_y = processing_utils.encode_array_to_base64(y)
        elif dtype == "file":
            out_y = processing_utils.encode_url_or_file_to_base64(y)
        elif dtype == "plot":
            out_y = processing_utils.encode_plot_to_base64(y)
        else:
            raise ValueError(
                "Unknown type: "
                + dtype
                + ". Please choose from: 'numpy', 'pil', 'file', 'plot'."
            )
        return out_y

    def deserialize(self, x):
        y = processing_utils.decode_base64_to_file(x).name
        return y

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )

    def edit(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("edit", fn, inputs, outputs)

    def clear(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("clear", fn, inputs, outputs)


class Video(Component):
    """
    Component creates a video file upload that is converted to a file path.

    Input type: filepath
    Output type: filepath
    Demos: video_flip
    """

    def __init__(
        self,
        default_value: str = "",
        *,
        type: Optional[str] = None,
        source: str = "upload",
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value(str): A path or URL for the default value that Video component is going to take.
        type (str): Type of video format to be returned by component, such as 'avi' or 'mp4'. Use 'mp4' to ensure browser playability. If set to None, video will keep uploaded format.
        source (str): Source of video. "upload" creates a box where user can drop an video file, "webcam" allows user to record a video from their webcam.
        label (str): component name in interface.
        optional (bool): If True, the interface can be submitted with no uploaded video, in which case the input value is None.
        """
        self.default_value = (
            processing_utils.encode_url_or_file_to_base64(default_value)
            if default_value
            else None
        )
        self.type = type
        self.source = source
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "source": self.source,
            "default_value": self.default_value,
            **super().get_template_context(),
        }

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
        if self.type is not None and uploaded_format != self.type:
            output_file_name = file_name[0 : file_name.rindex(".") + 1] + self.type
            ff = FFmpeg(inputs={file_name: None}, outputs={output_file_name: None})
            ff.run()
            return output_file_name
        else:
            return file_name

    def serialize(self, x, called_directly):
        raise NotImplementedError()

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to video file
        """
        return self.save_flagged_file(
            dir, label, None if data is None else data["data"], encryption_key
        )

    def generate_sample(self):
        return deepcopy(media_data.BASE64_VIDEO)

    def postprocess(self, y):
        """
        Parameters:
        y (str): path to video
        Returns:
        (str): base64 url data
        """
        returned_format = y.split(".")[-1].lower()
        if self.type is not None and returned_format != self.type:
            output_file_name = y[0 : y.rindex(".") + 1] + self.type
            ff = FFmpeg(inputs={y: None}, outputs={output_file_name: None})
            ff.run()
            y = output_file_name
        return {
            "name": os.path.basename(y),
            "data": processing_utils.encode_file_to_base64(y),
        }

    def deserialize(self, x):
        return processing_utils.decode_base64_to_file(x).name

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )

    def clear(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("clear", fn, inputs, outputs)

    def play(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("play", fn, inputs, outputs)

    def pause(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("pause", fn, inputs, outputs)

    def stop(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("stop", fn, inputs, outputs)


class Audio(Component):
    """
    Component accepts audio input files or creates an audio player that plays the output audio.


    Input type: Union[Tuple[int, numpy.array], file-object, numpy.array]
    Output type: Union[Tuple[int, numpy.array], str]
    Demos: main_note, generate_tone, reverse_audio, spectogram
    """

    def __init__(
        self,
        default_value="",
        *,
        source: str = "upload",
        type: str = "numpy",
        label: str = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): IGNORED
        source (str): Source of audio. "upload" creates a box where user can drop an audio file, "microphone" creates a microphone input.
        type (str): The format the image is converted to before being passed into the prediction function. "numpy" converts the image to a numpy array with shape (width, height, 3) and values from 0 to 255, "pil" converts the image to a PIL image object, "file" produces a temporary file object whose path can be retrieved by file_obj.name, "filepath" returns the path directly.
        label (str): component name in interface.
        """
        self.default_value = (
            processing_utils.encode_url_or_file_to_base64(default_value)
            if default_value
            else None
        )
        self.source = source
        requires_permissions = source == "microphone"
        self.type = type
        self.output_type = "auto"
        self.test_input = deepcopy(media_data.BASE64_AUDIO)
        self.interpret_by_tokens = True
        super().__init__(
            label=label, requires_permissions=requires_permissions, **kwargs
        )

    def get_template_context(self):
        return {
            "source": self.source,  # TODO: This did not exist in output template, careful here if an error arrives
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    def preprocess_example(self, x):
        return {"name": x, "data": None, "is_example": True}

    def preprocess(self, x: Dict[str, str] | None) -> Tuple[int, np.array] | str | None:
        """
        Parameters:
        x (Dict[name: str, data: str]): JSON object with filename as 'name' property and base64 data as 'data' property
        Returns:
        (Union[Tuple[int, numpy.array], str, numpy.array]): audio in requested format
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
        return self.save_flagged_file(
            dir, label, None if data is None else data["data"], encryption_key
        )

    def generate_sample(self):
        return deepcopy(media_data.BASE64_AUDIO)

    def postprocess(self, y):
        """
        Parameters:
        y (Union[Tuple[int, numpy.array], str]): audio data in requested format
        Returns:
        (str): base64 url data
        """
        if self.output_type in ["numpy", "file", "auto"]:
            if self.output_type == "numpy" or (
                self.output_type == "auto" and isinstance(y, tuple)
            ):
                sample_rate, data = y
                file = tempfile.NamedTemporaryFile(
                    prefix="sample", suffix=".wav", delete=False
                )
                processing_utils.audio_to_file(sample_rate, data, file.name)
                y = file.name
            return processing_utils.encode_url_or_file_to_base64(y)
        else:
            raise ValueError(
                "Unknown type: " + self.type + ". Please choose from: 'numpy', 'file'."
            )

    def deserialize(self, x):
        return processing_utils.decode_base64_to_file(x).name

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )

    def edit(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("edit", fn, inputs, outputs)

    def clear(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("clear", fn, inputs, outputs)

    def play(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("play", fn, inputs, outputs)

    def pause(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("pause", fn, inputs, outputs)

    def stop(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("stop", fn, inputs, outputs)


class File(Component):
    """
    Component accepts generic file uploads and output..

    Input type: Union[file-object, bytes, List[Union[file-object, bytes]]]
    Output type: Union[file-like, str]
    Demos: zip_to_json, zip_two_files
    """

    def __init__(
        self,
        default_value: str = "",
        *,
        file_count: str = "single",
        type: str = "file",
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): Default value given as file path
        file_count (str): if single, allows user to upload one file. If "multiple", user uploads multiple files. If "directory", user uploads all files in selected directory. Return type will be list for each file in case of "multiple" or "directory".
        type (str): Type of value to be returned by component. "file" returns a temporary file object whose path can be retrieved by file_obj.name, "binary" returns an bytes object.
        label (str): component name in interface.
        """
        if "keep_filename" in kwargs:
            warnings.warn("keep_filename is deprecated", DeprecationWarning)
        self.default_value = (
            processing_utils.encode_url_or_file_to_base64(default_value)
            if default_value
            else None
        )
        self.file_count = file_count
        self.type = type
        self.test_input = None
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "file_count": self.file_count,
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    def preprocess_example(self, x):
        return {"name": x, "data": None, "is_example": True}

    def preprocess(self, x: List[Dict[str, str]] | None):
        """
        Parameters:
        x (List[Dict[name: str, data: str]]): List of JSON objects with filename as 'name' property and base64 data as 'data' property
        Returns:
        (Union[file-object, bytes, List[Union[file-object, bytes]]]): File objects in requested format
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
        return self.save_flagged_file(
            dir, label, None if data is None else data[0]["data"], encryption_key
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
        return {
            "name": os.path.basename(y),
            "size": os.path.getsize(y),
            "data": processing_utils.encode_file_to_base64(y),
        }

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )

    def clear(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("clear", fn, inputs, outputs)


class Dataframe(Component):
    """
    Component accepts or displays 2D input  through a spreadsheet interface.

    Input or Output type: Union[pandas.DataFrame, numpy.array, List[Union[str, float]], List[List[Union[str, float]]]]
    Demos: filter_records, matrix_transpose, tax_calculator
    """

    def __init__(
        self,
        default_value: Optional[List[List[Any]]] = None,
        *,
        headers: Optional[List[str]] = None,
        row_count: int = 3,
        col_count: Optional[int] = 3,
        datatype: str | List[str] = "str",
        col_width: int | List[int] = None,
        type: str = "pandas",
        label: Optional[str] = None,
        max_rows: Optional[int] = 20,
        max_cols: Optional[int] = None,
        overflow_row_behaviour: str = "paginate",
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Input Parameters:
        default_value (List[List[Any]]): Default value as a pandas DataFrame. TODO: Add support for default value as a filepath
        headers (List[str]): Header names to dataframe. If None, no headers are shown.
        row_count (int): Limit number of rows for input.
        col_count (int): Limit number of columns for input. If equal to 1, return data will be one-dimensional. Ignored if `headers` is provided.
        datatype (Union[str, List[str]]): Datatype of values in sheet. Can be provided per column as a list of strings, or for the entire sheet as a single string. Valid datatypes are "str", "number", "bool", and "date".
        col_width (Union[int, List[int]]): Width of columns in pixels. Can be provided as single value or list of values per column.
        type (str): Type of value to be returned by component. "pandas" for pandas dataframe, "numpy" for numpy array, or "array" for a Python array.
        label (str): component name in interface.
        Output Parameters:
        headers (List[str]): Header names to dataframe. Only applicable if type is "numpy" or "array".
        max_rows (int): Maximum number of rows to display at once. Set to None for infinite.
        max_cols (int): Maximum number of columns to display at once. Set to None for infinite.
        overflow_row_behaviour (str): If set to "paginate", will create pages for overflow rows. If set to "show_ends", will show initial and final rows and truncate middle rows.
        """
        self.headers = headers
        self.datatype = datatype
        self.row_count = row_count
        self.col_count = len(headers) if headers else col_count
        self.col_width = col_width
        self.type = type
        self.output_type = "auto"
        default_values = {
            "str": "",
            "number": 0,
            "bool": False,
            "date": "01/01/1970",
        }
        column_dtypes = (
            [datatype] * self.col_count if isinstance(datatype, str) else datatype
        )
        self.test_input = [
            [default_values[c] for c in column_dtypes] for _ in range(row_count)
        ]
        self.default_value = (
            default_value if default_value is not None else self.test_input
        )
        self.max_rows = max_rows
        self.max_cols = max_cols
        self.overflow_row_behaviour = overflow_row_behaviour
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "headers": self.headers,
            "datatype": self.datatype,
            "row_count": self.row_count,
            "col_count": self.col_count,
            "col_width": self.col_width,
            "default_value": self.default_value,
            "max_rows": self.max_rows,
            "max_cols": self.max_cols,
            "overflow_row_behaviour": self.overflow_row_behaviour,
            **super().get_template_context(),
        }

    def preprocess(self, x: List[List[str | Number | bool]]):
        """
        Parameters:
        x (List[List[Union[str, number, bool]]]): 2D array of str, numeric, or bool data
        Returns:
        (Union[pandas.DataFrame, numpy.array, List[Union[str, float]], List[List[Union[str, float]]]]): Dataframe in requested format
        """
        if self.type == "pandas":
            if self.headers:
                return pd.DataFrame(x, columns=self.headers)
            else:
                return pd.DataFrame(x)
        if self.col_count == 1:
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
        Returns: (List[List[Union[str, float]]]) 2D array
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
        y (Union[pandas.DataFrame, numpy.array, List[Union[str, float]], List[List[Union[str, float]]]]): dataframe in given format
        Returns:
        (Dict[headers: List[str], data: List[List[Union[str, number]]]]): JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
        """
        if self.output_type == "auto":
            if isinstance(y, pd.core.frame.DataFrame):
                dtype = "pandas"
            elif isinstance(y, np.ndarray):
                dtype = "numpy"
            elif isinstance(y, list):
                dtype = "array"
            else:
                raise ValueError("Cannot determine the type of DataFrame output.")
        else:
            dtype = self.output_type
        if dtype == "pandas":
            return {"headers": list(y.columns), "data": y.values.tolist()}
        elif dtype in ("numpy", "array"):
            if dtype == "numpy":
                y = y.tolist()
            if len(y) == 0 or not isinstance(y[0], list):
                y = [y]
            return {"data": y}
        else:
            raise ValueError(
                "Unknown type: "
                + self.type
                + ". Please choose from: 'pandas', 'numpy', 'array'."
            )

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class Timeseries(Component):
    """
    Component accepts pandas.DataFrame uploaded as a timeseries csv file or renders a dataframe consisting of a time series as output.

    Input type: pandas.DataFrame
    Output type: pandas.DataFrame
    Demos: fraud_detector
    """

    def __init__(
        self,
        default_value: Optional[str] = None,
        *,
        x: Optional[str] = None,
        y: str | List[str] = None,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value: File path for the timeseries csv file. TODO: Add support for default value as a pd.DataFrame
        x (str): Column name of x (time) series. None if csv has no headers, in which case first column is x series.
        y (Union[str, List[str]]): Column name of y series, or list of column names if multiple series. None if csv has no headers, in which case every column after first is a y series.
        label (str): component name in interface.
        """
        self.default_value = (
            pd.read_csv(default_value) if default_value is not None else None
        )
        self.x = x
        if isinstance(y, str):
            y = [y]
        self.y = y
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "x": self.x,
            "y": self.y,
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    def preprocess_example(self, x):
        return {"name": x, "is_example": True}

    def preprocess(self, x: Dict | None) -> pd.DataFrame | None:
        """
        Parameters:
        x (Dict[data: List[List[Union[str, number, bool]]], headers: List[str], range: List[number]]): Dict with keys 'data': 2D array of str, numeric, or bool data, 'headers': list of strings for header names, 'range': optional two element list designating start of end of subrange.
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
        Returns: (List[List[Union[str, float]]]) 2D array
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
        y (pandas.DataFrame): timeseries data
        Returns:
        (Dict[headers: List[str], data: List[List[Union[str, number]]]]): JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
        """
        return {"headers": y.columns.values.tolist(), "data": y.values.tolist()}

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class Variable(Component):
    """
    Special hidden component that stores state across runs of the interface.

    Input type: Any
    Output type: Any
    Demos: chatbot
    """

    def __init__(
        self,
        default_value: Any = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (Any): the initial value of the state.
        label (str): component name in interface (not used).
        """
        self.default_value = default_value
        self.stateful = True
        super().__init__(**kwargs)

    def get_template_context(self):
        return {"default_value": self.default_value, **super().get_template_context()}


############################
# Only Output Components
############################


class Label(Component):
    """
    Component outputs a classification label, along with confidence scores of top categories if provided. Confidence scores are represented as a dictionary mapping labels to scores between 0 and 1.
    Output type: Union[Dict[str, float], str, int, float]
    Demos: image_classifier, main_note, titanic_survival
    """

    CONFIDENCES_KEY = "confidences"

    def __init__(
        self,
        default_value: str = "",
        *,
        num_top_classes: Optional[int] = None,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value(str): Default string value
        num_top_classes (int): number of most confident classes to show.
        label (str): component name in interface.
        """
        # TODO: Shall we have a default value for the label component?
        self.num_top_classes = num_top_classes
        self.output_type = "auto"
        super().__init__(label=label, css=css, **kwargs)

    def postprocess(self, y):
        """
        Parameters:
        y (Dict[str, float]): dictionary mapping label to confidence value
        Returns:
        (Dict[label: str, confidences: List[Dict[label: str, confidence: number]]]): Object with key 'label' representing primary label, and key 'confidences' representing a list of label-confidence pairs
        """
        if self.output_type == "label" or (
            self.output_type == "auto" and (isinstance(y, (str, numbers.Number)))
        ):
            return {"label": str(y)}
        elif self.output_type == "confidences" or (
            self.output_type == "auto" and isinstance(y, dict)
        ):
            sorted_pred = sorted(y.items(), key=operator.itemgetter(1), reverse=True)
            if self.num_top_classes is not None:
                sorted_pred = sorted_pred[: self.num_top_classes]
            return {
                "label": sorted_pred[0][0],
                "confidences": [
                    {"label": pred[0], "confidence": pred[1]} for pred in sorted_pred
                ],
            }
        else:
            raise ValueError(
                "The `Label` output interface expects one of: a string label, or an int label, a "
                "float label, or a dictionary whose keys are labels and values are confidences. "
                "Instead, got a {}".format(type(y))
            )

    def deserialize(self, y):
        # 5 cases: (1): {'label': 'lion'}, {'label': 'lion', 'confidences':...}, {'lion': 0.46, ...}, 'lion', '0.46'
        if self.output_type == "label" or (
            self.output_type == "auto"
            and (
                isinstance(y, (str, numbers.Number))
                or ("label" in y and not ("confidences" in y.keys()))
            )
        ):
            if isinstance(y, (str, numbers.Number)):
                return y
            else:
                return y["label"]
        elif self.output_type == "confidences" or self.output_type == "auto":
            if ("confidences" in y.keys()) and isinstance(y["confidences"], list):
                return {k["label"]: k["confidence"] for k in y["confidences"]}
            else:
                return y
        raise ValueError("Unable to deserialize output: {}".format(y))

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (Union[str, Dict[str, number]]): Either a string representing the main category label, or a dictionary with category keys mapping to confidence levels.
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

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class KeyValues(Component):
    """
    Component displays a table representing values for multiple fields.
    Output type: Union[Dict, List[Tuple[str, Union[str, int, float]]]]
    Demos: text_analysis
    """

    def __init__(
        self,
        default_value: str = " ",
        *,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default (str): IGNORED
        label (str): component name in interface.
        """
        raise DeprecationWarning(
            "The KeyValues component is deprecated. Please use the DataFrame or JSON "
            "components instead."
        )


class HighlightedText(Component):
    """
    Component creates text that contains spans that are highlighted by category or numerical value.
    Output is represent as a list of Tuple pairs, where the first element represents the span of text represented by the tuple, and the second element represents the category or value of the text.
    Output type: List[Tuple[str, Union[float, str]]]
    Demos: diff_texts, text_analysis
    """

    def __init__(
        self,
        default_value: str = "",
        *,
        color_map: Dict[str, str] = None,
        label: Optional[str] = None,
        show_legend: bool = False,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): Default value
        color_map (Dict[str, str]): Map between category and respective colors
        label (str): component name in interface.
        show_legend (bool): whether to show span categories in a separate legend or inline.
        """
        self.default_value = default_value
        self.color_map = color_map
        self.show_legend = show_legend
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "color_map": self.color_map,
            "show_legend": self.show_legend,
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    def postprocess(self, y):
        """
        Parameters:
        y (Union[Dict, List[Tuple[str, Union[str, int, float]]]]): dictionary or tuple list representing key value pairs
        Returns:
        (List[Tuple[str, Union[str, number]]]): list of key value pairs

        """
        return y

    def save_flagged(self, dir, label, data, encryption_key):
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class JSON(Component):
    """
    Used for JSON output. Expects a JSON string or a Python object that is JSON serializable.
    Output type: Union[str, Any]
    Demos: zip_to_json
    """

    def __init__(
        self,
        default_value: str = "",
        *,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): Default value
        label (str): component name in interface.
        """
        self.default_value = json.dumps(default_value)
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    def postprocess(self, y):
        """
        Parameters:
        y (Union[Dict, List, str]): JSON output
        Returns:
        (Union[Dict, List]): JSON output
        """
        if isinstance(y, str):
            return json.dumps(y)
        else:
            return y

    def save_flagged(self, dir, label, data, encryption_key):
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class HTML(Component):
    """
    Used for HTML output. Expects an HTML valid string.
    Output type: str
    Demos: text_analysis
    """

    def __init__(
        self,
        default_value: str = "",
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): Default value
        label (str): component name in interface.
        """
        self.default_value = default_value
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "default_value": self.default_value,
            **super().get_template_context(),
        }

    def postprocess(self, x):
        """
        Parameters:
        y (str): HTML output
        Returns:
        (str): HTML output
        """
        return x

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class Carousel(Component):
    """
    Component displays a set of output components that can be scrolled through.
    Output type: List[List[Any]]
    Demos: disease_report
    """

    def __init__(
        self,
        default_value="",
        *,
        components: Component | List[Component],
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): IGNORED
        components (Union[List[OutputComponent], OutputComponent]): Classes of component(s) that will be scrolled through.
        label (str): component name in interface.
        """
        # TODO: Shall we havea default value in carousel?
        if not isinstance(components, list):
            components = [components]
        self.components = [
            get_component_instance(component) for component in components
        ]
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "components": [
                component.get_template_context() for component in self.components
            ],
            **super().get_template_context(),
        }

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

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class Chatbot(Component):
    """
    Component displays a chatbot output showing both user submitted messages and responses
    Output type: List[Tuple[str, str]]
    Demos: chatbot
    """

    def __init__(
        self,
        default_value="",
        *,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): Default value
        label (str): component name in interface (not used).
        """
        self.default_value = default_value
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {"default_value": self.default_value, **super().get_template_context()}

    def postprocess(self, y):
        """
        Parameters:
        y (List[Tuple[str, str]]): List of tuples representing the message and response
        Returns:
        (List[Tuple[str, str]]): Returns same list of tuples

        """
        return y

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )


class Model3D(Component):
    """
    Component creates a 3D Model component with input and output capabilities.
    Input type: File object of type (.obj, glb, or .gltf)
    Output type: filepath
    Demos: Model3D
    """

    def __init__(
        self,
        clear_color=None,
        label: str = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        clear_color (List[r, g, b, a]): background color of scene
        label (str): component name in interface.
        """
        self.clear_color = clear_color
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {
            "clearColor": self.clear_color,
            **super().get_template_context(),
        }

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
        (str): file name
        (str): file extension
        (str): base64 url data
        """

        if self.clear_color is None:
            self.clear_color = [0.2, 0.2, 0.2, 1.0]

        return {
            "name": os.path.basename(y),
            "data": processing_utils.encode_file_to_base64(y),
        }

    def deserialize(self, x):
        return processing_utils.decode_base64_to_file(x).name

    def restore_flagged(self, dir, data, encryption_key):
        return self.restore_flagged_file(dir, data, encryption_key)

    def change(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("change", fn, inputs, outputs)

    def edit(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("edit", fn, inputs, outputs)

    def clear(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("clear", fn, inputs, outputs)


class Plot(Component):
    """
    Used for plot output.
    Output type: matplotlib plt, plotly figure, or Bokeh fig (json_item format)
    Demos: outbreak_forecast
    """

    def __init__(
        self,
        type: str = None,
        label: str = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        type (str): type of plot (matplotlib, plotly)
        label (str): component name in interface.
        """
        self.type = type
        super().__init__(label=label, css=css, **kwargs)

    def get_template_context(self):
        return {**super().get_template_context()}

    def postprocess(self, y):
        """
        Parameters:
        y (str): plot data
        Returns:
        (str): plot type
        (str): plot base64 or json
        """
        dtype = self.type
        if self.type == "plotly":
            out_y = y.to_json()
        elif self.type == "matplotlib":
            out_y = processing_utils.encode_plot_to_base64(y)
        elif self.type == "bokeh":
            out_y = json.dumps(y)
        elif self.type == "auto":
            if isinstance(y, (ModuleType, matplotlib.pyplot.Figure)):
                dtype = "matplotlib"
                out_y = processing_utils.encode_plot_to_base64(y)
            elif isinstance(y, dict):
                dtype = "bokeh"
                out_y = json.dumps(y)
            else:
                dtype = "plotly"
                out_y = y.to_json()
        else:
            raise ValueError(
                "Unknown type. Please choose from: 'plotly', 'matplotlib', 'bokeh'."
            )
        return {"type": dtype, "plot": out_y}

    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker
        )

    def clear(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("clear", fn, inputs, outputs)


############################
# Static Components
############################


class Markdown(Component):
    """
    Used for Markdown output. Expects a valid string that is rendered into Markdown.
    """

    def __init__(
        self,
        default_value: str = "",
        *,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): Default value
        label (str): component name
        css (dict): optional css parameters for the component
        """
        super().__init__(label=label, css=css, **kwargs)
        self.md = MarkdownIt()
        unindented_default_value = inspect.cleandoc(default_value)
        self.default_value = self.md.render(unindented_default_value)

    def get_template_context(self):
        return {"default_value": self.default_value, **super().get_template_context()}


class Button(Component):
    """
    Used to create a button, that can be assigned arbitrary click() events.
    """

    def __init__(
        self,
        default_value: str = "",
        *,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        default_value (str): Default value
        label (str): component name
        css (dict): optional css parameters for the component
        """
        super().__init__(label=label, css=css, **kwargs)
        self.default_value = default_value

    def get_template_context(self):
        return {"default_value": self.default_value, **super().get_template_context()}

    def click(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        queue=False,
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "click",
            fn,
            inputs,
            outputs,
            queue=queue,
            status_tracker=status_tracker,
        )

    def _click_no_preprocess(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "click",
            fn,
            inputs,
            outputs,
            preprocess=False,
            status_tracker=status_tracker,
        )


class Dataset(Component):
    """
    Used to create a output widget for showing datasets. Used to render the examples
    box in the interface.
    """

    def __init__(
        self,
        *,
        components: List[Component],
        samples: List[List[Any]],
        type: str = "values",
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        super().__init__(label=label, css=css, **kwargs)
        self.components = components
        self.type = type
        self.headers = [c.label for c in components]
        self.samples = samples

    def get_template_context(self):
        return {
            "components": [component.get_block_name() for component in self.components],
            "headers": self.headers,
            "samples": self.samples,
            "type": self.type,
            **super().get_template_context(),
        }

    def preprocess(self, x: Any) -> Any:
        """
        Any preprocessing needed to be performed on function input.
        """
        if self.type == "index":
            return x
        elif self.type == "values":
            return self.samples[x]

    def click(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "click", fn, inputs, outputs, status_tracker=status_tracker
        )

    def _click_no_postprocess(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status: StatusTracker to visualize function progress
        Returns: None
        """
        self.set_event_trigger(
            "click",
            fn,
            inputs,
            outputs,
            postprocess=False,
            status_tracker=status_tracker,
        )


class Interpretation(Component):
    """
    Used to create an interpretation widget for a component.
    """

    def __init__(
        self,
        component: Component,
        *,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        super().__init__(label=label, css=css, **kwargs)
        self.component = component

    def get_template_context(self):
        return {
            "component": self.component.get_block_name(),
            "component_props": self.component.get_template_context(),
        }


def component(str_shortcut: str) -> Optional[Component]:
    """
    Creates a component, where class name equals to str_shortcut.

    @param str_shortcut: string shortcut of a component
    @return component: the component object
    """
    component = Component.get_component_shortcut(str_shortcut)
    if component is None:
        raise ValueError(f"No such component: {str_shortcut}")
    else:
        return component


def get_component_instance(comp: str | dict | Component):
    if isinstance(comp, str):
        component = Component.get_component_shortcut(comp)
        if component is None:
            raise ValueError(f"No such component: {comp}")
        else:
            return component
    elif isinstance(
        comp, dict
    ):  # a dict with `name` as the input component type and other keys as parameters
        name = comp.pop("name")
        for component in Component.__subclasses__():
            if component.__name__.lower() == name:
                break
        else:
            raise ValueError(f"No such Component: {name}")
        return component(**comp, without_rendering=True)
    elif isinstance(comp, Component):
        return comp
    else:
        raise ValueError(
            f"Component must provided as a `str` or `dict` or `Component` but is {comp}"
        )


class StatusTracker(Component):
    """
    Used to indicate status of a function call. Event listeners can bind to a StatusTracker with 'status=' keyword argument.
    """

    def __init__(
        self,
        *,
        cover_container: bool = False,
        label: Optional[str] = None,
        css: Optional[Dict] = None,
        **kwargs,
    ):
        """
        Parameters:
        cover_container (bool): If True, will expand to cover parent container while function pending.
        label (str): component name
        css (dict): optional css parameters for the component
        """
        super().__init__(label=label, css=css, **kwargs)
        self.cover_container = cover_container

    def get_template_context(self):
        return {
            "cover_container": self.cover_container,
            **super().get_template_context(),
        }
