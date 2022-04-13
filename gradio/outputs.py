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
from black import out
from ffmpy import FFmpeg

from gradio import processing_utils
from gradio.component import Component

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio import Interface


class OutputComponent(Component):
    """
    Output Component. All output components subclass this.
    """

    def __init__(self, label: str):
        self.component_type = "output"
        super().__init__(label)

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


class Textbox(OutputComponent):
    """
    Component creates a textbox to render output text or number.
    Output type: Union[str, float, int]
    Demos: hello_world, sentence_builder
    """

    def __init__(self, type: str = "auto", label: Optional[str] = None):
        """
        Parameters:
        type (str): Type of value to be passed to component. "str" expects a string, "number" expects a float value, "auto" detects return type.
        label (str): component name in interface.
        """
        self.type = type
        super().__init__(label)

    def get_template_context(self):
        return {**super().get_template_context()}

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "text": {"type": "str"},
            "textbox": {"type": "str"},
            "number": {"type": "number"},
        }

    def postprocess(self, y):
        """
        Parameters:
        y (str): text output
        Returns:
        (Union[str, number]): output value
        """
        if self.type == "str" or self.type == "auto":
            return str(y)
        elif self.type == "number":
            return y
        else:
            raise ValueError(
                "Unknown type: " + self.type + ". Please choose from: 'str', 'number'"
            )


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


class Image(OutputComponent):
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
        if plot:
            warnings.warn(
                "The 'plot' parameter has been deprecated. Set parameter 'type' to 'plot' instead.",
                DeprecationWarning,
            )
            self.type = "plot"
        else:
            self.type = type
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {"image": {}, "plot": {"type": "plot"}, "pil": {"type": "pil"}}

    def postprocess(self, y):
        """
        Parameters:
        y (Union[numpy.array, PIL.Image, str, matplotlib.pyplot, Tuple[Union[numpy.array, PIL.Image, str], List[Tuple[str, float, float, float, float]]]]): image in specified format
        Returns:
        (str): base64 url data
        """
        if self.type == "auto":
            if isinstance(y, np.ndarray):
                dtype = "numpy"
            elif isinstance(y, PIL.Image.Image):
                dtype = "pil"
            elif isinstance(y, str):
                dtype = "file"
            elif isinstance(y, ModuleType):
                dtype = "plot"
            else:
                raise ValueError(
                    "Unknown type. Please choose from: 'numpy', 'pil', 'file', 'plot'."
                )
        else:
            dtype = self.type
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

    def save_flagged(self, dir, label, data, encryption_key):
        return self.save_flagged_file(dir, label, data, encryption_key)

    def restore_flagged(self, dir, data, encryption_key):
        return self.restore_flagged_file(dir, data, encryption_key)["data"]


class Video(OutputComponent):
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
        self.type = type
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {"video": {}, "playable_video": {"type": "mp4"}}

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

    def save_flagged(self, dir, label, data, encryption_key):
        return self.save_flagged_file(dir, label, data["data"], encryption_key)

    def restore_flagged(self, dir, data, encryption_key):
        return self.restore_flagged_file(dir, data, encryption_key)


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


class Audio(OutputComponent):
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
        self.type = type
        super().__init__(label)

    def get_template_context(self):
        return {**super().get_template_context()}

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "audio": {},
        }

    def postprocess(self, y):
        """
        Parameters:
        y (Union[Tuple[int, numpy.array], str]): audio data in requested format
        Returns:
        (str): base64 url data
        """
        if self.type in ["numpy", "file", "auto"]:
            if self.type == "numpy" or (self.type == "auto" and isinstance(y, tuple)):
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

    def save_flagged(self, dir, label, data, encryption_key):
        return self.save_flagged_file(dir, label, data, encryption_key)

    def restore_flagged(self, dir, data, encryption_key):
        return self.restore_flagged_file(dir, data, encryption_key)["data"]


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


class File(OutputComponent):
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
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "file": {},
        }

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

    def save_flagged(self, dir, label, data, encryption_key):
        return self.save_flagged_file(dir, label, data["data"], encryption_key)

    def restore_flagged(self, dir, data, encryption_key):
        return self.restore_flagged_file(dir, data, encryption_key)


class Dataframe(OutputComponent):
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
        self.headers = headers
        self.max_rows = max_rows
        self.max_cols = max_cols
        self.overflow_row_behaviour = overflow_row_behaviour
        self.type = type
        super().__init__(label)

    def get_template_context(self):
        return {
            "headers": self.headers,
            "max_rows": self.max_rows,
            "max_cols": self.max_cols,
            "overflow_row_behaviour": self.overflow_row_behaviour,
            **super().get_template_context(),
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "dataframe": {},
            "numpy": {"type": "numpy"},
            "matrix": {"type": "array"},
            "list": {"type": "array"},
        }

    def postprocess(self, y):
        """
        Parameters:
        y (Union[pandas.DataFrame, numpy.array, List[Union[str, float]], List[List[Union[str, float]]]]): dataframe in given format
        Returns:
        (Dict[headers: List[str], data: List[List[Union[str, number]]]]): JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
        """
        if self.type == "auto":
            if isinstance(y, pd.core.frame.DataFrame):
                dtype = "pandas"
            elif isinstance(y, np.ndarray):
                dtype = "numpy"
            elif isinstance(y, list):
                dtype = "array"
        else:
            dtype = self.type
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

    def save_flagged(self, dir, label, data, encryption_key):
        return json.dumps(data["data"])

    def restore_flagged(self, dir, data, encryption_key):
        return {"data": json.loads(data)}


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


class Timeseries(OutputComponent):
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
        self.x = x
        if isinstance(y, str):
            y = [y]
        self.y = y
        super().__init__(label)

    def get_template_context(self):
        return {"x": self.x, "y": self.y, **super().get_template_context()}

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "timeseries": {},
        }

    def postprocess(self, y):
        """
        Parameters:
        y (pandas.DataFrame): timeseries data
        Returns:
        (Dict[headers: List[str], data: List[List[Union[str, number]]]]): JSON object with key 'headers' for list of header names, 'data' for 2D array of string or numeric data
        """
        return {"headers": y.columns.values.tolist(), "data": y.values.tolist()}

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (List[List[Union[str, float]]]) 2D array
        """
        return json.dumps(data)

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)


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


class Plot(OutputComponent):
    """
    Used for plot output.
    Output type: matplotlib plt or plotly figure
    Demos: outbreak_forecast
    """

    def __init__(self, type: str = None, label: Optional[str] = None):
        """
        Parameters:
        type (str): type of plot (matplotlib, plotly)
        label (str): component name in interface.
        """
        self.type = type
        super().__init__(label)

    def get_template_context(self):
        return {**super().get_template_context()}

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "plot": {},
        }

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
            if isinstance(y, ModuleType):
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

    def deserialize(self, x):
        y = processing_utils.decode_base64_to_file(x).name
        return y

    def save_flagged(self, dir, label, data, encryption_key):
        return self.save_flagged_file(dir, label, data, encryption_key)


class Image3D(OutputComponent):
    """
    Used for 3d image model output.
    Output type: filepath
    Demos: Image3D
    """

    def __init__(self, clear_color=None, label=None):
        """
        Parameters:
        clear_color (List[r, g, b, a]): background color of scene
        label (str): component name in interface.
        """
        super().__init__(label)
        self.clear_color = clear_color

    def get_template_context(self):
        return {**super().get_template_context()}

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "Image3D": {},
        }

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
            "extension": os.path.splitext(y)[1],
            "clearColor": self.clear_color,
            "data": processing_utils.encode_file_to_base64(y),
        }

    def deserialize(self, x):
        return processing_utils.decode_base64_to_file(x).name

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to model file
        """
        return self.save_flagged_file(dir, label, data["data"], encryption_key)


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
