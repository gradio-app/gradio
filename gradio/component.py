from __future__ import annotations

import os
import shutil
import warnings
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from gradio import processing_utils
from gradio.blocks import Block


class Component(Block):
    """
    A base class for defining the methods that all gradio input and output components should have.
    """

    def __init__(
        self, label: str, requires_permissions: bool = False, optional: bool = False
    ):
        self.label = label
        self.requires_permissions = requires_permissions
        self.set_interpret_parameters()
        self.optional = optional
        self.input = False
        self.output = False
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
            "optional": self.optional,
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
    Component creates a textbox for user to enter input. Provides a string as an argument to the wrapped function.
    Input type: str
    Demos: hello_world, diff_texts

    Component creates a textbox to render output text or number.
    Output type: Union[str, float, int]
    Demos: hello_world, sentence_builder
    """

    def __init__(
        self,
        lines: int = 1,
        placeholder: Optional[str] = None,
        default: str = "",
        label: Optional[str] = None,
        numeric: Optional[bool] = False,
        type: Optional[str] = "str",
        optional: bool = False,
        component_type: str = "static",
    ):
        """
        Parameters:
        lines (int): number of line rows to provide in textarea.
        placeholder (str): placeholder hint to provide behind textarea.
        default (str): default text to provide in textarea.
        label (str): component name in interface.
        numeric (bool): DEPRECATED.
        type (str): DEPRECATED. However, currently supported in gr.outputs
        optional (bool): DEPRECATED
        """
        self.lines = lines
        self.placeholder = placeholder
        self.default = default
        self.type = "str"
        if numeric:
            warnings.warn(
                "The 'numeric' type has been deprecated. Use the Number component instead.",
                DeprecationWarning,
            )
        if type:
            warnings.warn(
                "The 'type' parameter has been deprecated. Use the Number component instead if you need it.",
                DeprecationWarning,
            )
        self.test_input = default
        self.interpret_by_tokens = True
        self.component_type = component_type
        super().__init__(label)

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

    def preprocess(self, x: str) -> str:
        """
        Parameters:
        x (str): text input
        """
        return x

    def preprocess_example(self, x: str) -> str:
        """
        Returns:
        (str): Text representing function input
        """
        return x

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
        self, x, neighbors, scores: List[float], tokens: List[str], masks=None
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

    def postprocess(self, y: str):
        """
        Parameters:
            y (str): text output
        Returns:
            str(y)
        """
        # TODO: (faruk) Remove after type parameter is removed in version 3.0
        if self.type == "str" or self.type == "auto":
            return str(y)
        elif self.type == "number":
            return y
        else:
            raise ValueError(
                "Unknown type: " + self.type + ". Please choose from: 'str', 'number'"
            )
