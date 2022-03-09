"""
This module defines various classes that can serve as the `input` to an interface. Each class must inherit from
`InputComponent`, and each class must define a path to its template. All of the subclasses of `InputComponent` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

from __future__ import annotations

import json
import os
import tempfile
import warnings
from typing import TYPE_CHECKING, Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import PIL
from ffmpy import FFmpeg

from gradio import processing_utils, test_data
from gradio.components import (
    Checkbox,
    CheckboxGroup,
    Component,
    Dropdown,
    Number,
    Radio,
    Slider,
    Textbox,
)

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio import Interface


# TODO: (faruk) Remove this file in version 3.0
class Textbox(Textbox):
    def __init__(
        self,
        lines: int = 1,
        placeholder: Optional[str] = None,
        default: str = "",
        numeric: Optional[bool] = False,
        type: Optional[str] = "str",
        label: Optional[str] = None,
        optional: bool = False,
    ):
        warnings.warn(
            "Usage of gradio.inputs is deprecated, and will not be supported in the future, please import your component from gradio.components",
            DeprecationWarning,
        )
        super().__init__(
            lines=lines,
            placeholder=placeholder,
            default=default,
            numeric=numeric,
            type=type,
            label=label,
            optional=optional,
        )


class Number(Number):
    """
    Component creates a field for user to enter numeric input. Provides a number as an argument to the wrapped function.
    Input type: float
    Demos: tax_calculator, titanic_survival
    """

    def __init__(
        self,
        default: Optional[float] = None,
        label: Optional[str] = None,
        optional: bool = False,
    ):
        """
        Parameters:
        default (float): default value.
        label (str): component name in interface.
        optional (bool): If True, the interface can be submitted with no value for this component.
        """
        warnings.warn(
            "Usage of gradio.inputs is deprecated, and will not be supported in the future, please import your component from gradio.components",
            DeprecationWarning,
        )
        super().__init__(default=default, label=label, optional=optional)


class Slider(Slider):
    """
    Component creates a slider that ranges from `minimum` to `maximum`. Provides a number as an argument to the wrapped function.
    Input type: float
    Demos: sentence_builder, generate_tone, titanic_survival
    """

    def __init__(
        self,
        minimum: float = 0,
        maximum: float = 100,
        step: Optional[float] = None,
        default: Optional[float] = None,
        label: Optional[str] = None,
        optional: bool = False,
    ):
        """
        Parameters:
        minimum (float): minimum value for slider.
        maximum (float): maximum value for slider.
        step (float): increment between slider values.
        default (float): default value.
        label (str): component name in interface.
        optional (bool): this parameter is ignored.
        """
        warnings.warn(
            "Usage of gradio.inputs is deprecated, and will not be supported in the future, please import your component from gradio.components",
            DeprecationWarning,
        )

        super().__init__(
            label=label,
            minimum=minimum,
            maximum=maximum,
            step=step,
            default=default,
            optional=optional,
        )


class Checkbox(Checkbox):
    """
    Component creates a checkbox that can be set to `True` or `False`. Provides a boolean as an argument to the wrapped function.
    Input type: bool
    Demos: sentence_builder, titanic_survival
    """

    def __init__(
        self,
        default: bool = False,
        label: Optional[str] = None,
        optional: bool = False,
    ):
        """
        Parameters:
        label (str): component name in interface.
        default (bool): if True, checked by default.
        optional (bool): this parameter is ignored.
        """
        warnings.warn(
            "Usage of gradio.inputs is deprecated, and will not be supported in the future, please import your component from gradio.components",
            DeprecationWarning,
        )
        super().__init__(label=label, default=default, optional=optional)


class CheckboxGroup(CheckboxGroup):
    """
    Component creates a set of checkboxes of which a subset can be selected. Provides a list of strings representing the selected choices as an argument to the wrapped function.
    Input type: Union[List[str], List[int]]
    Demos: sentence_builder, titanic_survival, fraud_detector
    """

    def __init__(
        self,
        choices: List[str],
        default: List[str] = [],
        type: str = "value",
        label: Optional[str] = None,
        optional: bool = False,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        default (List[str]): default selected list of options.
        type (str): Type of value to be returned by component. "value" returns the list of strings of the choices selected, "index" returns the list of indicies of the choices selected.
        label (str): component name in interface.
        optional (bool): this parameter is ignored.
        """
        warnings.warn(
            "Usage of gradio.inputs is deprecated, and will not be supported in the future, please import your component from gradio.components",
            DeprecationWarning,
        )
        super().__init__(
            choices=choices, default=default, type=type, label=label, optional=optional
        )


class Radio(Radio):
    """
    Component creates a set of radio buttons of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.
    Input type: Union[str, int]
    Demos: sentence_builder, tax_calculator, titanic_survival
    """

    def __init__(
        self,
        choices: List[str],
        type: str = "value",
        default: Optional[str] = None,
        label: Optional[str] = None,
        optional: bool = False,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        default (str): the button selected by default. If None, no button is selected by default.
        label (str): component name in interface.
        optional (bool): this parameter is ignored.
        """
        warnings.warn(
            "Usage of gradio.inputs is deprecated, and will not be supported in the future, please import your component from gradio.components",
            DeprecationWarning,
        )
        super().__init__(
            choices=choices, type=type, default=default, label=label, optional=optional
        )


class Dropdown(Dropdown):
    """
    Component creates a dropdown of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.
    Input type: Union[str, int]
    Demos: sentence_builder, filter_records, titanic_survival
    """

    def __init__(
        self,
        choices: List[str],
        type: str = "value",
        default: Optional[str] = None,
        label: Optional[str] = None,
        optional: bool = False,
    ):
        """
        Parameters:
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        default (str): default value selected in dropdown. If None, no value is selected by default.
        label (str): component name in interface.
        optional (bool): this parameter is ignored.
        """
        warnings.warn(
            "Usage of gradio.inputs is deprecated, and will not be supported in the future, please import your component from gradio.components",
            DeprecationWarning,
        )
        super().__init__(
            choices=choices, type=type, default=default, label=label, optional=optional
        )


class InputComponent(Component):
    """
    Input Component. All input components subclass this.
    """

    def __init__(
        self, label: str, requires_permissions: bool = False, optional: bool = False
    ):
        """
        Constructs an input component.
        """
        self.component_type = "input"
        self.set_interpret_parameters()
        self.optional = optional
        super().__init__(label=label, requires_permissions=requires_permissions)

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
        pass

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

    def get_template_context(self):
        return {
            "optional": self.optional,
            **super().get_template_context(),
        }


class Image(InputComponent):
    """
    Component creates an image upload box with editing capabilities.
    Input type: Union[numpy.array, PIL.Image, file-object]
    Demos: image_classifier, image_mod, webcam, digit_classifier
    """

    def __init__(
        self,
        shape: Tuple[int, int] = None,
        image_mode: str = "RGB",
        invert_colors: bool = False,
        source: str = "upload",
        tool: str = "editor",
        type: str = "numpy",
        label: str = None,
        optional: bool = False,
    ):
        """
        Parameters:
        shape (Tuple[int, int]): (width, height) shape to crop and resize image to; if None, matches input image size.
        image_mode (str): "RGB" if color, or "L" if black and white.
        invert_colors (bool): whether to invert the image as a preprocessing step.
        source (str): Source of image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "canvas" defaults to a white image that can be edited and drawn upon with tools.
        tool (str): Tools used for editing. "editor" allows a full screen editor, "select" provides a cropping and zoom tool.
        type (str): Type of value to be returned by component. "numpy" returns a numpy array with shape (width, height, 3) and values from 0 to 255, "pil" returns a PIL image object, "file" returns a temporary file object whose path can be retrieved by file_obj.name, "filepath" returns the path directly.
        label (str): component name in interface.
        optional (bool): If True, the interface can be submitted with no uploaded image, in which case the input value is None.
        """
        self.shape = shape
        self.image_mode = image_mode
        self.source = source
        requires_permissions = source == "webcam"
        self.tool = tool
        self.type = type
        self.invert_colors = invert_colors
        self.test_input = test_data.BASE64_IMAGE
        self.interpret_by_tokens = True
        super().__init__(label, requires_permissions, optional=optional)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "image": {},
            "webcam": {"source": "webcam"},
            "sketchpad": {
                "image_mode": "L",
                "source": "canvas",
                "shape": (28, 28),
                "invert_colors": True,
            },
        }

    def get_template_context(self):
        return {
            "image_mode": self.image_mode,
            "shape": self.shape,
            "source": self.source,
            "tool": self.tool,
            "optional": self.optional,
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
                delete=False, suffix=("." + fmt.lower() if fmt is not None else ".png")
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
                delete=False, suffix=("." + fmt.lower() if fmt is not None else ".png")
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

    def get_interpretation_scores(self, x, neighbors, scores, masks, tokens=None):
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

    def generate_sample(self):
        return test_data.BASE64_IMAGE


class Video(InputComponent):
    """
    Component creates a video file upload that is converted to a file path.
    Input type: filepath
    Demos: video_flip
    """

    def __init__(
        self,
        type: Optional[str] = None,
        source: str = "upload",
        label: Optional[str] = None,
        optional: bool = False,
    ):
        """
        Parameters:
        type (str): Type of video format to be returned by component, such as 'avi' or 'mp4'. If set to None, video will keep uploaded format.
        source (str): Source of video. "upload" creates a box where user can drop an video file, "webcam" allows user to record a video from their webcam.
        label (str): component name in interface.
        optional (bool): If True, the interface can be submitted with no uploaded video, in which case the input value is None.
        """
        self.type = type
        self.source = source
        super().__init__(label, optional=optional)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "video": {},
        }

    def get_template_context(self):
        return {
            "source": self.source,
            "optional": self.optional,
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
        return test_data.BASE64_VIDEO


class Audio(InputComponent):
    """
    Component accepts audio input files.
    Input type: Union[Tuple[int, numpy.array], file-object, numpy.array]
    Demos: main_note, reverse_audio, spectogram
    """

    def __init__(
        self,
        source: str = "upload",
        type: str = "numpy",
        label: str = None,
        optional: bool = False,
    ):
        """
        Parameters:
        source (str): Source of audio. "upload" creates a box where user can drop an audio file, "microphone" creates a microphone input.
        type (str): Type of value to be returned by component. "numpy" returns a 2-set tuple with an integer sample_rate and the data numpy.array of shape (samples, 2), "file" returns a temporary file object whose path can be retrieved by file_obj.name, "filepath" returns the path directly.
        label (str): component name in interface.
        optional (bool): If True, the interface can be submitted with no uploaded audio, in which case the input value is None.
        """
        self.source = source
        requires_permissions = source == "microphone"
        self.type = type
        self.test_input = test_data.BASE64_AUDIO
        self.interpret_by_tokens = True
        super().__init__(label, requires_permissions, optional=optional)

    def get_template_context(self):
        return {
            "source": self.source,
            "optional": self.optional,
            **super().get_template_context(),
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "audio": {},
            "microphone": {"source": "microphone"},
            "mic": {"source": "microphone"},
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
        return test_data.BASE64_AUDIO


class File(InputComponent):
    """
    Component accepts generic file uploads.
    Input type: Union[file-object, bytes, List[Union[file-object, bytes]]]
    Demos: zip_to_json, zip_two_files
    """

    def __init__(
        self,
        file_count: str = "single",
        type: str = "file",
        label: Optional[str] = None,
        keep_filename: bool = True,
        optional: bool = False,
    ):
        """
        Parameters:
        file_count (str): if single, allows user to upload one file. If "multiple", user uploads multiple files. If "directory", user uploads all files in selected directory. Return type will be list for each file in case of "multiple" or "directory".
        type (str): Type of value to be returned by component. "file" returns a temporary file object whose path can be retrieved by file_obj.name, "binary" returns an bytes object.
        label (str): component name in interface.
        keep_filename (bool): DEPRECATED. Original filename always kept.
        optional (bool): If True, the interface can be submitted with no uploaded image, in which case the input value is None.
        """
        self.file_count = file_count
        self.type = type
        self.test_input = None
        super().__init__(label, optional=optional)

    def get_template_context(self):
        return {
            "file_count": self.file_count,
            "optional": self.optional,
            **super().get_template_context(),
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "file": {},
            "files": {"file_count": "multiple"},
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
        return test_data.BASE64_FILE


class Dataframe(InputComponent):
    """
    Component accepts 2D input through a spreadsheet interface.
    Input type: Union[pandas.DataFrame, numpy.array, List[Union[str, float]], List[List[Union[str, float]]]]
    Demos: filter_records, matrix_transpose, tax_calculator
    """

    def __init__(
        self,
        headers: Optional[List[str]] = None,
        row_count: int = 3,
        col_count: Optional[int] = 3,
        datatype: str | List[str] = "str",
        col_width: int | List[int] = None,
        default: Optional[List[List[Any]]] = None,
        type: str = "pandas",
        label: Optional[str] = None,
        optional: bool = False,
    ):
        """
        Parameters:
        headers (List[str]): Header names to dataframe. If None, no headers are shown.
        row_count (int): Limit number of rows for input.
        col_count (int): Limit number of columns for input. If equal to 1, return data will be one-dimensional. Ignored if `headers` is provided.
        datatype (Union[str, List[str]]): Datatype of values in sheet. Can be provided per column as a list of strings, or for the entire sheet as a single string. Valid datatypes are "str", "number", "bool", and "date".
        col_width (Union[int, List[int]]): Width of columns in pixels. Can be provided as single value or list of values per column.
        default (List[List[Any]]): Default value
        type (str): Type of value to be returned by component. "pandas" for pandas dataframe, "numpy" for numpy array, or "array" for a Python array.
        label (str): component name in interface.
        optional (bool): this parameter is ignored.
        """
        self.headers = headers
        self.datatype = datatype
        self.row_count = row_count
        self.col_count = len(headers) if headers else col_count
        self.col_width = col_width
        self.type = type
        self.default = (
            default
            if default is not None
            else [[None for _ in range(self.col_count)] for _ in range(self.row_count)]
        )
        sample_values = {
            "str": "abc",
            "number": 786,
            "bool": True,
            "date": "02/08/1993",
        }
        column_dtypes = (
            [datatype] * self.col_count if isinstance(datatype, str) else datatype
        )
        self.test_input = [
            [sample_values[c] for c in column_dtypes] for _ in range(row_count)
        ]

        super().__init__(label)

    def get_template_context(self):
        return {
            "headers": self.headers,
            "datatype": self.datatype,
            "row_count": self.row_count,
            "col_count": self.col_count,
            "col_width": self.col_width,
            "default": self.default,
            **super().get_template_context(),
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "dataframe": {"type": "pandas"},
            "numpy": {"type": "numpy"},
            "matrix": {"type": "array"},
            "list": {"type": "array", "col_count": 1},
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

    def restore_flagged(self, dir, data, encryption_key):
        return json.loads(data)

    def generate_sample(self):
        return [[1, 2, 3], [4, 5, 6]]


class Timeseries(InputComponent):
    """
    Component accepts pandas.DataFrame uploaded as a timeseries csv file.
    Input type: pandas.DataFrame
    Demos: fraud_detector
    """

    def __init__(
        self,
        x: Optional[str] = None,
        y: str | List[str] = None,
        label: Optional[str] = None,
        optional: bool = False,
    ):
        """
        Parameters:
        x (str): Column name of x (time) series. None if csv has no headers, in which case first column is x series.
        y (Union[str, List[str]]): Column name of y series, or list of column names if multiple series. None if csv has no headers, in which case every column after first is a y series.
        label (str): component name in interface.
        optional (bool): If True, the interface can be submitted with no uploaded csv file, in which case the input value is None.
        """
        self.x = x
        if isinstance(y, str):
            y = [y]
        self.y = y
        super().__init__(label, optional=optional)

    def get_template_context(self):
        return {
            "x": self.x,
            "y": self.y,
            "optional": self.optional,
            **super().get_template_context(),
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "timeseries": {},
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


class State(InputComponent):
    """
    Special hidden component that stores state across runs of the interface.
    Input type: Any
    Demos: chatbot
    """

    def __init__(
        self,
        label: str = None,
        default: Any = None,
        optional: bool = False,
    ):
        """
        Parameters:
        label (str): component name in interface (not used).
        default (Any): the initial value of the state.
        optional (bool): this parameter is ignored.
        """

        self.default = default
        super().__init__(label)

    def get_template_context(self):
        return {"default": self.default, **super().get_template_context()}

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "state": {},
        }


def get_input_instance(iface: Interface):
    if isinstance(iface, str):
        shortcut = InputComponent.get_all_shortcut_implementations()[iface]
        return shortcut[0](**shortcut[1])
    elif isinstance(
        iface, dict
    ):  # a dict with `name` as the input component type and other keys as parameters
        name = iface.pop("name")
        for component in InputComponent.__subclasses__():
            if component.__name__.lower() == name:
                break
        else:
            raise ValueError("No such InputComponent: {}".format(name))
        return component(**iface)
    elif isinstance(iface, InputComponent):
        return iface
    else:
        raise ValueError(
            "Input interface must be of type `str` or `dict` or "
            "`InputComponent` but is {}".format(iface)
        )
