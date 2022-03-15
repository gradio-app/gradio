"""
This module defines various classes that can serve as the `output` to an interface. Each class must inherit from
`OutputComponent`, and each class must define a path to its template. All of the subclasses of `OutputComponent` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

from __future__ import annotations

import json
import operator
import os
import tempfile
import warnings
from numbers import Number
from types import ModuleType
from typing import TYPE_CHECKING, Dict, List, Optional

import numpy as np
import pandas as pd
import PIL
from ffmpy import FFmpeg

from gradio import processing_utils
from gradio.components import (
    Audio,
    Component,
    Dataframe,
    File,
    Image,
    Textbox,
    Timeseries,
    Video,
)

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio import Interface


# TODO: (faruk) Remove this file in version 3.0
class Textbox(Textbox):
    def __init__(
        self,
        type: str = "auto",
        label: Optional[str] = None,
    ):
        # TODO: (faruk) Remove this file in version 3.0
        warnings.warn(
            "Usage of gradio.outputs is deprecated, and will not be supported in the future, please import your components from gradio.components",
            DeprecationWarning,
        )
        super().__init__(type=type, label=label)


class Image(Image):
    """
    Component displays an output image.
    Output type: Union[numpy.array, PIL.Image, str, matplotlib.pyplot, Tuple[Union[numpy.array, PIL.Image, str], List[Tuple[str, float, float, float, float]]]]
    Demos: image_mod, webcam
    """

    def __init__(
        self, type: str = "auto", plot: bool = False, label: Optional[str] = None
    ):
        """
        Parameters:
        type (str): Type of value to be passed to component. "numpy" expects a numpy array with shape (width, height, 3), "pil" expects a PIL image object, "file" expects a file path to the saved image or a remote URL, "plot" expects a matplotlib.pyplot object, "auto" detects return type.
        plot (bool): DEPRECATED. Whether to expect a plot to be returned by the function.
        label (str): component name in interface.
        """
        warnings.warn(
            "Usage of gradio.outputs is deprecated, and will not be supported in the future, please import your components from gradio.components",
            DeprecationWarning,
        )
        super().__init__(label=label, type=type, plot=plot)


class Video(Video):
    """
    Used for video output.
    Output type: filepath
    Demos: video_flip
    """

    def __init__(self, type: Optional[str] = None, label: Optional[str] = None):
        """
        Parameters:
        type (str): Type of video format to be passed to component, such as 'avi' or 'mp4'. Use 'mp4' to ensure browser playability. If set to None, video will keep returned format.
        label (str): component name in interface.
        """
        warnings.warn(
            "Usage of gradio.outputs is deprecated, and will not be supported in the future, please import your components from gradio.components",
            DeprecationWarning,
        )
        super().__init__(label=label, type=type)


class Audio(Audio):
    """
    Creates an audio player that plays the output audio.
    Output type: Union[Tuple[int, numpy.array], str]
    Demos: generate_tone, reverse_audio
    """

    def __init__(self, type: str = "auto", label: Optional[str] = None):
        """
        Parameters:
        type (str): Type of value to be passed to component. "numpy" returns a 2-set tuple with an integer sample_rate and the data as 16-bit int numpy.array of shape (samples, 2), "file" returns a temporary file path to the saved wav audio file, "auto" detects return type.
        label (str): component name in interface.
        """
        warnings.warn(
            "Usage of gradio.outputs is deprecated, and will not be supported in the future, please import your components from gradio.components",
            DeprecationWarning,
        )
        super().__init__(type=type, label=label)


class File(File):
    """
    Used for file output.
    Output type: Union[file-like, str]
    Demos: zip_two_files
    """

    def __init__(self, label: Optional[str] = None):
        """
        Parameters:
        label (str): component name in interface.
        """
        warnings.warn(
            "Usage of gradio.outputs is deprecated, and will not be supported in the future, please import your components from gradio.components",
            DeprecationWarning,
        )
        super().__init__(label=label)


class Dataframe(Dataframe):
    """
    Component displays 2D output through a spreadsheet interface.
    Output type: Union[pandas.DataFrame, numpy.array, List[Union[str, float]], List[List[Union[str, float]]]]
    Demos: filter_records, matrix_transpose, fraud_detector
    """

    def __init__(
        self,
        headers: Optional[List[str]] = None,
        max_rows: Optional[int] = 20,
        max_cols: Optional[int] = None,
        overflow_row_behaviour: str = "paginate",
        type: str = "auto",
        label: Optional[str] = None,
    ):
        """
        Parameters:
        headers (List[str]): Header names to dataframe. Only applicable if type is "numpy" or "array".
        max_rows (int): Maximum number of rows to display at once. Set to None for infinite.
        max_cols (int): Maximum number of columns to display at once. Set to None for infinite.
        overflow_row_behaviour (str): If set to "paginate", will create pages for overflow rows. If set to "show_ends", will show initial and final rows and truncate middle rows.
        type (str): Type of value to be passed to component. "pandas" for pandas dataframe, "numpy" for numpy array, or "array" for Python array, "auto" detects return type.
        label (str): component name in interface.
        """
        warnings.warn(
            "Usage of gradio.outputs is deprecated, and will not be supported in the future, please import your components from gradio.components",
            DeprecationWarning,
        )
        super().__init__(
            headers=headers,
            max_rows=max_rows,
            max_cols=max_cols,
            overflow_row_behaviour=overflow_row_behaviour,
            type=type,
            label=label,
        )


class Timeseries(Timeseries):
    """
    Component accepts pandas.DataFrame.
    Output type: pandas.DataFrame
    Demos: fraud_detector
    """

    def __init__(
        self, x: str = None, y: str | List[str] = None, label: Optional[str] = None
    ):
        """
        Parameters:
        x (str): Column name of x (time) series. None if csv has no headers, in which case first column is x series.
        y (Union[str, List[str]]): Column name of y series, or list of column names if multiple series. None if csv has no headers, in which case every column after first is a y series.
        label (str): component name in interface.
        """
        warnings.warn(
            "Usage of gradio.outputs is deprecated, and will not be supported in the future, please import your components from gradio.components",
            DeprecationWarning,
        )
        super().__init__(x=x, y=y, label=label)


class OutputComponent(Component):
    """
    Output Component. All output components subclass this.
    """

    def __init__(self, label: str):
        self.component_type = "output"
        super().__init__(label=label)

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


class Label(OutputComponent):
    """
    Component outputs a classification label, along with confidence scores of top categories if provided. Confidence scores are represented as a dictionary mapping labels to scores between 0 and 1.
    Output type: Union[Dict[str, float], str, int, float]
    Demos: image_classifier, main_note, titanic_survival
    """

    CONFIDENCES_KEY = "confidences"

    def __init__(
        self,
        num_top_classes: Optional[int] = None,
        type: str = "auto",
        label: Optional[str] = None,
    ):
        """
        Parameters:
        num_top_classes (int): number of most confident classes to show.
        type (str): Type of value to be passed to component. "value" expects a single out label, "confidences" expects a dictionary mapping labels to confidence scores, "auto" detects return type.
        label (str): component name in interface.
        """
        self.num_top_classes = num_top_classes
        self.type = type
        super().__init__(label)

    def postprocess(self, y):
        """
        Parameters:
        y (Dict[str, float]): dictionary mapping label to confidence value
        Returns:
        (Dict[label: str, confidences: List[Dict[label: str, confidence: number]]]): Object with key 'label' representing primary label, and key 'confidences' representing a list of label-confidence pairs
        """
        if self.type == "label" or (
            self.type == "auto" and (isinstance(y, str) or isinstance(y, Number))
        ):
            return {"label": str(y)}
        elif self.type == "confidences" or (
            self.type == "auto" and isinstance(y, dict)
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
                "float label, or a dictionary whose keys are labels and values are confidences."
            )

    def deserialize(self, y):
        # 5 cases: (1): {'label': 'lion'}, {'label': 'lion', 'confidences':...}, {'lion': 0.46, ...}, 'lion', '0.46'
        if self.type == "label" or (
            self.type == "auto"
            and (
                isinstance(y, str)
                or isinstance(y, int)
                or isinstance(y, float)
                or ("label" in y and not ("confidences" in y.keys()))
            )
        ):
            if isinstance(y, str) or isinstance(y, int) or isinstance(y, float):
                return y
            else:
                return y["label"]
        elif self.type == "confidences" or self.type == "auto":
            if ("confidences" in y.keys()) and isinstance(y["confidences"], list):
                return {k["label"]: k["confidence"] for k in y["confidences"]}
            else:
                return y
        raise ValueError("Unable to deserialize output: {}".format(y))

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "label": {},
        }

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


class KeyValues(OutputComponent):
    """
    Component displays a table representing values for multiple fields.
    Output type: Union[Dict, List[Tuple[str, Union[str, int, float]]]]
    Demos: text_analysis
    """

    def __init__(self, label: Optional[str] = None):
        """
        Parameters:
        label (str): component name in interface.
        """
        super().__init__(label)

    def postprocess(self, y):
        """
        Parameters:
        y (Union[Dict, List[Tuple[str, Union[str, int, float]]]]): dictionary or tuple list representing key value pairs
        Returns:
        (List[Tuple[str, Union[str, number]]]): list of key value pairs
        """
        if isinstance(y, dict):
            return list(y.items())
        elif isinstance(y, list):
            return y
        else:
            raise ValueError(
                "The `KeyValues` output interface expects an output that is a dictionary whose keys are "
                "labels and values are corresponding values."
            )

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "key_values": {},
        }

    def save_flagged(self, dir, label, data, encryption_key):
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)


class HighlightedText(OutputComponent):
    """
    Component creates text that contains spans that are highlighted by category or numerical value.
    Output is represent as a list of Tuple pairs, where the first element represents the span of text represented by the tuple, and the second element represents the category or value of the text.
    Output type: List[Tuple[str, Union[float, str]]]
    Demos: diff_texts, text_analysis
    """

    def __init__(
        self,
        color_map: Dict[str, str] = None,
        label: Optional[str] = None,
        show_legend: bool = False,
    ):
        """
        Parameters:
        color_map (Dict[str, str]): Map between category and respective colors
        label (str): component name in interface.
        show_legend (bool): whether to show span categories in a separate legend or inline.
        """
        self.color_map = color_map
        self.show_legend = show_legend
        super().__init__(label)

    def get_template_context(self):
        return {
            "color_map": self.color_map,
            "show_legend": self.show_legend,
            **super().get_template_context(),
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "highlight": {},
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


class JSON(OutputComponent):
    """
    Used for JSON output. Expects a JSON string or a Python object that is JSON serializable.
    Output type: Union[str, Any]
    Demos: zip_to_json
    """

    def __init__(self, label: Optional[str] = None):
        """
        Parameters:
        label (str): component name in interface.
        """
        super().__init__(label)

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

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "json": {},
        }

    def save_flagged(self, dir, label, data, encryption_key):
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)


class HTML(OutputComponent):
    """
    Used for HTML output. Expects an HTML valid string.
    Output type: str
    Demos: text_analysis
    """

    def __init__(self, label: Optional[str] = None):
        """
        Parameters:
        label (str): component name in interface.
        """
        super().__init__(label)

    def postprocess(self, x):
        """
        Parameters:
        y (str): HTML output
        Returns:
        (str): HTML output
        """
        return x

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "html": {},
        }


class Carousel(OutputComponent):
    """
    Component displays a set of output components that can be scrolled through.
    Output type: List[List[Any]]
    Demos: disease_report
    """

    def __init__(
        self,
        components: OutputComponent | List[OutputComponent],
        label: Optional[str] = None,
    ):
        """
        Parameters:
        components (Union[List[OutputComponent], OutputComponent]): Classes of component(s) that will be scrolled through.
        label (str): component name in interface.
        """
        if not isinstance(components, list):
            components = [components]
        self.components = [get_output_instance(component) for component in components]
        super().__init__(label)

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


class Chatbot(OutputComponent):
    """
    Component displays a chatbot output showing both user submitted messages and responses
    Output type: List[Tuple[str, str]]
    Demos: chatbot
    """

    def __init__(self, label: Optional[str] = None):
        """
        Parameters:
        label (str): component name in interface (not used).
        """
        super().__init__(label)

    def get_template_context(self):
        return {**super().get_template_context()}

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "chatbot": {},
        }

    def postprocess(self, y):
        """
        Parameters:
        y (List[Tuple[str, str]]): List of tuples representing the message and response
        Returns:
        (List[Tuple[str, str]]): Returns same list of tuples

        """
        return y


class State(OutputComponent):
    """
    Special hidden component that stores state across runs of the interface.
    Output type: Any
    Demos: chatbot
    """

    def __init__(self, label: Optional[str] = None):
        """
        Parameters:
        label (str): component name in interface (not used).
        """
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "state": {},
        }


def get_output_instance(iface: Interface):
    if isinstance(iface, str):
        shortcut = OutputComponent.get_all_shortcut_implementations()[iface]
        return shortcut[0](**shortcut[1])
    # a dict with `name` as the output component type and other keys as parameters
    elif isinstance(iface, dict):
        name = iface.pop("name")
        for component in OutputComponent.__subclasses__():
            if component.__name__.lower() == name:
                break
        else:
            raise ValueError("No such OutputComponent: {}".format(name))
        return component(**iface)
    elif isinstance(iface, OutputComponent):
        return iface
    else:
        raise ValueError(
            "Output interface must be of type `str` or `dict` or"
            "`OutputComponent` but is {}".format(iface)
        )
