from __future__ import annotations

import json
import math
import os
import shutil
import warnings
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from gradio import processing_utils
from gradio.blocks import Block


class Component(Block):
    """
    A base class for defining the methods that all gradio components should have.
    """

    def __init__(
        self,
        *,
        label: str,
        requires_permissions: bool = False,
        **kwargs,
    ):
        if "optional" in kwargs:
            warnings.warn("Usage of optional is deprecated, and it has no effect")
        self.label = label
        self.requires_permissions = requires_permissions

        self.set_interpret_parameters()
        super().__init__()

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return f"{type(self).__name__} (label={self.label})"

    def get_template_context(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {
            "name": self.__class__.__name__.lower(),
            "label": self.label,
        }

    @classmethod
    def get_shortcut_implementations(cls):
        """
        Return dictionary of shortcut implementations
        """
        return {}

    def save_flagged(
        self, dir: str, label: str, data: Any, encryption_key: bool
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
        self, dir: str, label: str, data: Any, encryption_key: bool
    ) -> Optional[str]:
        """
        Saved flagged data (e.g. image or audio) as a file and returns filepath
        """
        if data is None:
            return None
        file = processing_utils.decode_base64_to_file(data, encryption_key)
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
    def get_all_shortcut_implementations(cls):
        shortcuts = {}
        for sub_cls in cls.__subclasses__():
            for shortcut, parameters in sub_cls.get_shortcut_implementations().items():
                shortcuts[shortcut] = (sub_cls, parameters)
        return shortcuts

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


class Textbox(Component):
    """
    Component creates a textbox for user to enter string input or display string output. Provides a string as an argument to the wrapped function.
    Input type: str
    Output type: str

    Demos: hello_world, diff_texts, sentence_builder
    """

    def __init__(
        self,
        default: str = "",
        *,
        lines: int = 1,
        placeholder: Optional[str] = None,
        label: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        default (str): default text to provide in textarea.
        lines (int): number of line rows to provide in textarea.
        placeholder (str): placeholder hint to provide behind textarea.
        label (str): component name in interface.
        numeric (bool): DEPRECATED.
        type (str): DEPRECATED.
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
        default = str(default)
        self.lines = lines
        self.placeholder = placeholder
        self.default = default
        self.test_input = default
        self.interpret_by_tokens = True
        super().__init__(label=label, **kwargs)

    def get_template_context(self):
        return {
            "lines": self.lines,
            "placeholder": self.placeholder,
            "default": self.default,
            **super().get_template_context(),
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "text": {},
            "textbox": {"lines": 7},
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
        default: Optional[float] = None,
        *,
        label: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        default (float): default value.
        label (str): component name in interface.
        """
        default = float(default)
        self.default = default
        self.test_input = default if default is not None else 1
        self.interpret_by_tokens = False
        super().__init__(label=label, **kwargs)

    def get_template_context(self):
        return {"default": self.default, **super().get_template_context()}

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "number": {},
        }

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

    def preprocess_example(self, x: float | None) -> float:
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


class Slider(Component):
    """
    Component creates a slider that ranges from `minimum` to `maximum`. Provides a number as an argument to the wrapped function.

    Input type: float
    Demos: sentence_builder, generate_tone, titanic_survival
    """

    def __init__(
        self,
        default: Optional[float] = None,
        *,
        minimum: float = 0,
        maximum: float = 100,
        step: Optional[float] = None,
        label: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        default (float): default value.
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
        self.default = minimum if default is None else default
        self.test_input = self.default
        self.interpret_by_tokens = False
        super().__init__(label=label, **kwargs)

    def get_template_context(self):
        return {
            "minimum": self.minimum,
            "maximum": self.maximum,
            "step": self.step,
            "default": self.default,
            **super().get_template_context(),
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "slider": {},
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


class Checkbox(Component):
    """
    Component creates a checkbox that can be set to `True` or `False`. Provides a boolean as an argument to the wrapped function.

    Input type: bool
    Output type: bool
    Demos: sentence_builder, titanic_survival
    """

    def __init__(self, default: bool = False, *, label: Optional[str] = None, **kwargs):
        """
        Parameters:
        default (bool): if True, checked by default.
        label (str): component name in interface.
        """
        self.test_input = True
        self.default = default
        self.interpret_by_tokens = False
        super().__init__(label=label, **kwargs)

    def get_template_context(self):
        return {"default": self.default, **super().get_template_context()}

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "checkbox": {},
        }

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


class CheckboxGroup(Component):
    """
    Component creates a set of checkboxes of which a subset can be selected. Provides a list of strings representing the selected choices as an argument to the wrapped function.

    Input type: Union[List[str], List[int]]
    Demos: sentence_builder, titanic_survival, fraud_detector
    """

    def __init__(
        self,
        default: List[str] = None,
        *,
        choices: List[str],
        type: str = "value",
        label: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        default (List[str]): default selected list of options.
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the list of strings of the choices selected, "index" returns the list of indicies of the choices selected.
        label (str): component name in interface.
        """
        if (
            default is None
        ):  # Mutable parameters shall not be given as default parameters in the function.
            default = []
        self.choices = choices
        self.default = default
        self.type = type
        self.test_input = self.choices
        self.interpret_by_tokens = False
        super().__init__(label=label, **kwargs)

    def get_template_context(self):
        return {
            "choices": self.choices,
            "default": self.default,
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


class Radio(Component):
    """
    Component creates a set of radio buttons of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.

    Input type: Union[str, int]
    Demos: sentence_builder, tax_calculator, titanic_survival
    """

    def __init__(
        self,
        default: Optional[str] = None,
        *,
        choices: List[str],
        type: str = "value",
        label: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        default (str): the button selected by default. If None, no button is selected by default.
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        label (str): component name in interface.
        """
        self.choices = choices
        self.type = type
        self.test_input = self.choices[0]
        self.default = default if default is not None else self.choices[0]
        self.interpret_by_tokens = False
        super().__init__(label=label, **kwargs)

    def get_template_context(self):
        return {
            "choices": self.choices,
            "default": self.default,
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


class Dropdown(Radio):
    """
    Component creates a dropdown of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.

    Input type: Union[str, int]
    Demos: sentence_builder, filter_records, titanic_survival
    """

    def __init__(
        self,
        default: Optional[str] = None,
        *,
        choices: List[str],
        type: str = "value",
        label: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        default (str): default value selected in dropdown. If None, no value is selected by default.
        label (str): component name in interface.
        """
        # Everything is same with Dropdown and Radio, so let's make use of it :)
        super().__init__(
            default=default, choices=choices, type=type, label=label, **kwargs
        )
