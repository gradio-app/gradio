"""
This module defines various classes that can serve as the `input` to an interface. Each class must inherit from
`InputComponent`, and each class must define a path to its template. All of the subclasses of `InputComponent` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

import datetime
import json
import os
import time
import warnings
from gradio.component import Component

import base64
import numpy as np
import PIL
import scipy.io.wavfile
from gradio import processing_utils
import pandas as pd
import math
import tempfile

class InputComponent(Component):
    """
    Input Component. All input components subclass this.
    """
    pass

class Textbox(InputComponent):
    """
    Component creates a textbox for user to enter input. Provides a string (or number is `type` is "float") as an argument to the wrapped function.
    Input type: str
    """

    def __init__(self, lines=1, placeholder=None, default=None, numeric=False, type="str", label=None):
        """
        Parameters:
        lines (int): number of line rows to provide in textarea.
        placeholder (str): placeholder hint to provide behind textarea.
        default (str): default text to provide in textarea.
        numeric (bool): DEPRECATED. Whether the input should be parsed as a number instead of a string.        
        type (str): Type of value to be returned by component. "str" returns a string, "number" returns a float value.
        label (str): component name in interface.
        """
        self.lines = lines
        self.placeholder = placeholder
        self.default = default
        if numeric:
            warnings.warn("The 'numeric' parameter has been deprecated. Set parameter 'type' to 'number' instead.", DeprecationWarning)
            self.type = "number"
        else:
            self.type = type
        self.test_input = {
            "str": "the quick brown fox jumped over the lazy dog",
            "number": 786.92,
        }[type]
        super().__init__(label)

    def get_template_context(self):
        return {
            "lines": self.lines,
            "placeholder": self.placeholder,
            "default": self.default,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "text": {},
            "textbox": {"lines": 7},
            "number": {"type": "number"}
        }

    def preprocess(self, x):
        if self.type == "str":
            return x
        elif self.type == "number":
            return float(x)
        else:
            raise ValueError("Unknown type: " + self.type + ". Please choose from: 'str', 'number'.")


class Slider(InputComponent):
    """
    Component creates a slider that ranges from `minimum` to `maximum`. Provides a number as an argument to the wrapped function.
    Input type: float
    """

    def __init__(self, minimum=0, maximum=100, step=None, default=None, label=None):
        '''
        Parameters:
        minimum (float): minimum value for slider.
        maximum (float): maximum value for slider.
        step (float): increment between slider values.
        default (float): default value.
        label (str): component name in interface.
        '''
        self.minimum = minimum
        self.maximum = maximum
        if step is None:
            difference = maximum - minimum
            power = math.floor(math.log10(difference) - 1)
            step = 10 ** power
        self.step = step
        self.default = minimum if default is None else default
        self.test_input = self.default
        super().__init__(label)

    def get_template_context(self):
        return {
            "minimum": self.minimum,
            "maximum": self.maximum,
            "step": self.step,
            "default": self.default,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "slider": {},
        }


class Checkbox(InputComponent):
    """
    Component creates a checkbox that can be set to `True` or `False`. Provides a boolean as an argument to the wrapped function.
    Input type: bool
    """

    def __init__(self, label=None):
        """
        Parameters:
        label (str): component name in interface.
        """
        self.test_input = True
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "checkbox": {},
        }


class CheckboxGroup(InputComponent):
    """
    Component creates a set of checkboxes of which a subset can be selected. Provides a list of strings representing the selected choices as an argument to the wrapped function.
    Input type: Union[List[str], List[int]]
    """

    def __init__(self, choices, type="value", label=None):
        '''
        Parameters:
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the list of strings of the choices selected, "index" returns the list of indicies of the choices selected.
        label (str): component name in interface.
        '''
        self.choices = choices
        self.type = type
        self.test_input = self.preprocess(self.choices)
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            **super().get_template_context()
        }

    def preprocess(self, x):
        if self.type == "value":
            return x
        elif self.type == "index":
            return [self.choices.index(choice) for choice in x]
        else:
            raise ValueError("Unknown type: " + self.type + ". Please choose from: 'value', 'index'.")


class Radio(InputComponent):
    """
    Component creates a set of radio buttons of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.
    Input type: Union[str, int]
    """

    def __init__(self, choices, type="value", label=None):
        '''
        Parameters:
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        label (str): component name in interface.
        '''
        self.choices = choices
        self.type = type
        self.test_input = self.preprocess(self.choices)
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            **super().get_template_context()
        }

    def preprocess(self, x):
        if self.type == "value":
            return x
        elif self.type == "index":
            return self.choices.index(x)
        else:
            raise ValueError("Unknown type: " + self.type + ". Please choose from: 'value', 'index'.")


class Dropdown(InputComponent):
    """
    Component creates a dropdown of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.
    Input type: Union[str, int]
    """

    def __init__(self, choices, type="value", label=None):
        '''
        Parameters:
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        label (str): component name in interface.
        '''
        self.choices = choices
        self.type = type
        self.test_input = self.preprocess(self.choices)
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            **super().get_template_context()
        }

    def preprocess(self, x):
        if self.type == "value":
            return x
        elif self.type == "index":
            return self.choices.index(x)
        else:
            raise ValueError("Unknown type: " + self.type + ". Please choose from: 'value', 'index'.")


class Image(InputComponent):
    """
    Component creates an image upload box with editing capabilities. 
    Input type: Union[numpy.array, PIL.Image, str]
    """

    def __init__(self, shape=None, image_mode='RGB', invert_colors=False, source="upload", tool="editor", type="numpy", label=None):
        '''
        Parameters:
        shape (Tuple[int, int]): shape to crop and resize image to; if None, matches input image size.
        image_mode (str): "RGB" if color, or "L" if black and white.
        invert_colors (bool): whether to invert the image as a preprocessing step.
        source (str): Source of image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "canvas" defaults to a white image that can be edited and drawn upon with tools.
        tool (str): Tools used for editing. "editor" allows a full screen editor, "select" provides a cropping and zoom tool.
        type (str): Type of value to be returned by component. "numpy" returns a numpy array with shape (width, height, 3) and values from 0 to 255, "pil" returns a PIL image object, "file" returns a temporary file object whose path can be retrieved by file_obj.name.
        label (str): component name in interface.
        '''
        self.shape = shape
        self.image_mode = image_mode
        self.source = source
        self.tool = tool
        self.type = type
        self.invert_colors = invert_colors

        base64_image = "data:image/gif;base64,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"
        self.test_input = self.preprocess(base64_image)
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "image": {},
            "webcam": {"source": "webcam"},
            "sketchpad": {"image_mode": "L", "source": "canvas", "shape": (28, 28), "invert_colors": True},
        }

    def get_template_context(self):
        return {
            "image_mode": self.image_mode,
            "source": self.source,
            "tool": self.tool,
            **super().get_template_context()
        }

    def preprocess(self, x):
        im = processing_utils.decode_base64_to_image(x)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            im = im.convert(self.image_mode)
        if self.shape is not None:
            im = processing_utils.resize_and_crop(
                im, (self.shape[0], self.shape[1]))
        if self.invert_colors:
            im = PIL.ImageOps.invert(im)
        if self.type == "pil":
            return im
        elif self.type == "numpy":
            return np.array(im)
        elif self.type == "file":
            file_obj = tempfile.NamedTemporaryFile()
            im.save(file_obj.name)
            return file_obj
        else:
            raise ValueError("Unknown type: " + self.type + ". Please choose from: 'numpy', 'pil', 'file'.")

    def process_example(self, example):
        if os.path.exists(example):
            return processing_utils.encode_file_to_base64(example)
        else:
            return example

    def rebuild(self, dir, data):
        """
        Default rebuild method to decode a base64 image
        """
        im = processing_utils.decode_base64_to_image(data)
        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save(f'{dir}/{filename}', 'PNG')
        return filename


class Audio(InputComponent):
    """
    Component accepts audio input files. 
    Input type: Union[Tuple[int, numpy.array], str, numpy.array]
    """

    def __init__(self, source="upload", type="numpy", label=None):
        """
        Parameters:
        source (str): Source of audio. "upload" creates a box where user can drop an audio file, "microphone" creates a microphone input.
        type (str): Type of value to be returned by component. "numpy" returns a 2-set tuple with an integer sample_rate and the data numpy.array of shape (samples, 2), "file" returns a temporary file object whose path can be retrieved by file_obj.name, "mfcc" returns the mfcc coefficients of the input audio.
        label (str): component name in interface.
        """
        self.source = source
        self.type = type
        base64_audio = "data:audio/ogg;base64,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"
        self.test_input = self.preprocess(base64_audio)
        super().__init__(label)

    def get_template_context(self):
        return {
            "source": self.source,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "audio": {},
            "microphone": {"source": "microphone"}
        }

    def preprocess(self, x):
        """
        By default, no pre-processing is applied to a microphone input file
        """
        file_obj = processing_utils.decode_base64_to_file(x)
        if self.type == "file":
            return file_obj
        elif self.type == "numpy":
            return scipy.io.wavfile.read(file_obj.name)
        elif self.type == "mfcc":
            return processing_utils.generate_mfcc_features_from_audio_file(file_obj.name)


class File(InputComponent):
    """
    Component accepts generic file uploads.
    Input type: Union[str, bytes]
    """

    def __init__(self, type="file", label=None):
        '''
        Parameters:
        type (str): Type of value to be returned by component. "file" returns a temporary file object whose path can be retrieved by file_obj.name, "binary" returns an bytes object.
        label (str): component name in interface.
        '''
        self.type = type
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "file": {},
        }

    def preprocess(self, x):
        if self.type == "file":
            return processing_utils.decode_base64_to_file(x)
        elif self.type == "bytes":
            return processing_utils.decode_base64_to_binary(x)
        else:
            raise ValueError("Unknown type: " + self.type + ". Please choose from: 'file', 'bytes'.")


class Dataframe(InputComponent):
    """
    Component accepts 2D input through a spreadsheet interface.
    Input type: Union[pandas.DataFrame, numpy.array, List[Union[str, float]], List[List[Union[str, float]]]]
    """

    def __init__(self, headers=None, row_count=3, col_count=3, datatype="str", type="pandas", label=None):
        """
        Parameters:
        headers (List[str]): Header names to dataframe.
        row_count (int): Limit number of rows for input.
        col_count (int): Limit number of columns for input. If equal to 1, return data will be one-dimensional. Ignored if `headers` is provided.
        datatype (Union[str, List[str]]): Datatype of values in sheet. Can be provided per column as a list of strings, or for the entire sheet as a single string. Valid datatypes are "str", "number", "bool", and "date".
        type (str): Type of value to be returned by component. "pandas" for pandas dataframe, "numpy" for numpy array, or "array" for a Python array.
        label (str): component name in interface.
        """
        self.headers = headers
        self.datatype = datatype
        self.row_count = row_count
        self.col_count = len(headers) if headers else col_count
        self.type = type
        sample_values = {"str": "abc", "number": 786, "bool": True, "date": "02/08/1993"}
        column_dtypes = [datatype]*self.col_count if isinstance(datatype, str) else datatype
        self.test_input = [[sample_values[c] for c in column_dtypes] for _ in range(row_count)]
        super().__init__(label)

    def get_template_context(self):
        return {
            "headers": self.headers,
            "datatype": self.datatype,
            "row_count": self.row_count,
            "col_count": self.col_count,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "dataframe": {"type": "pandas"},
            "numpy": {"type": "numpy"},
            "matrix": {"type": "array"},
            "list": {"type": "array", "col_count": 1},
        }

    def preprocess(self, x):
        if self.type == "pandas":
            if self.headers:
                return pd.DataFrame(x, columns=self.headers)
            else:
                return pd.DataFrame(x)
        if self.col_count == 1:
            x = x[0]
        if self.type == "numpy":
            return np.array(x)
        elif self.type == "array":
            return x
        else:
            raise ValueError("Unknown type: " + self.type + ". Please choose from: 'pandas', 'numpy', 'array'.")

#######################
# DEPRECATED COMPONENTS
#######################

class Sketchpad(InputComponent):
    """
    DEPRECATED. Component creates a sketchpad for black and white illustration. Provides numpy array of shape `(width, height)` as an argument to the wrapped function.
    Input type: numpy.array
    """

    def __init__(self, shape=(28, 28), invert_colors=True,
                 flatten=False, label=None):
        '''
        Parameters:
        shape (Tuple[int, int]): shape to crop and resize image to.
        invert_colors (bool): whether to represent black as 1 and white as 0 in the numpy array.
        flatten (bool): whether to reshape the numpy array to a single dimension.
        label (str): component name in interface.
        '''
        warnings.warn("Sketchpad has been deprecated. Please use 'Image' component to generate a sketchpad. The string shorcut 'sketchpad' has been moved to the Image component.", DeprecationWarning)
        self.image_width = shape[0]
        self.image_height = shape[1]
        self.invert_colors = invert_colors
        self.flatten = flatten
        super().__init__(label)

    def preprocess(self, x):
        """
        Default preprocessing method for the SketchPad is to convert the sketch to black and white and resize 28x28
        """
        im_transparent = processing_utils.decode_base64_to_image(x)
        # Create a white background for the alpha channel
        im = PIL.Image.new("RGBA", im_transparent.size, "WHITE")
        im.paste(im_transparent, (0, 0), im_transparent)
        im = im.convert('L')
        if self.invert_colors:
            im = PIL.ImageOps.invert(im)
        im = im.resize((self.image_width, self.image_height))
        if self.flatten:
            array = np.array(im).flatten().reshape(
                1, self.image_width * self.image_height)
        else:
            array = np.array(im).flatten().reshape(
                1, self.image_width, self.image_height)
        return array

    def process_example(self, example):
        return processing_utils.encode_file_to_base64(example)

    def rebuild(self, dir, data):
        """
        Default rebuild method to decode a base64 image
        """
        im = processing_utils.decode_base64_to_image(data)
        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save(f'{dir}/{filename}', 'PNG')
        return filename


class Webcam(InputComponent):
    """
    DEPRECATED. Component creates a webcam for captured image input. Provides numpy array of shape `(width, height, 3)` as an argument to the wrapped function.
    Input type: numpy.array
    """

    def __init__(self, shape=(224, 224), label=None):
        '''
        Parameters:
        shape (Tuple[int, int]): shape to crop and resize image to.
        label (str): component name in interface.
        '''
        warnings.warn("Webcam has been deprecated. Please use 'Image' component to generate a webcam. The string shorcut 'webcam' has been moved to the Image component.", DeprecationWarning)
        self.image_width = shape[0]
        self.image_height = shape[1]
        self.num_channels = 3
        super().__init__(label)

    def preprocess(self, x):
        """
        Default preprocessing method for is to convert the picture to black and white and resize to be 48x48
        """
        im = processing_utils.decode_base64_to_image(x)
        im = im.convert('RGB')
        im = processing_utils.resize_and_crop(
            im, (self.image_width, self.image_height))
        return np.array(im)

    def rebuild(self, dir, data):
        """
        Default rebuild method to decode a base64 image
        """
        im = processing_utils.decode_base64_to_image(data)
        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save('{}/{}'.format(dir, filename), 'PNG')
        return filename


class Microphone(InputComponent):
    """
    DEPRECATED. Component creates a microphone element for audio inputs. 
    Input type: numpy.array
    """

    def __init__(self, preprocessing=None, label=None):
        '''
        Parameters:
        preprocessing (Union[str, Callable]): preprocessing to apply to input
        label (str): component name in interface.
        '''
        warnings.warn("Microphone has been deprecated. Please use 'Audio' component to generate a microphone. The string shorcut 'microphone' has been moved to the Audio component.", DeprecationWarning)
        super().__init__(label)
        if preprocessing is None or preprocessing == "mfcc":
            self.preprocessing = preprocessing
        else:
            raise ValueError(
                "unexpected value for preprocessing", preprocessing)

    def preprocess(self, x):
        """
        By default, no pre-processing is applied to a microphone input file
        """
        file_obj = processing_utils.decode_base64_to_file(x)
        if self.preprocessing == "mfcc":
            return processing_utils.generate_mfcc_features_from_audio_file(file_obj.name)
        _, signal = scipy.io.wavfile.read(file_obj.name)
        return signal


    def rebuild(self, dir, data):
        inp = data.split(';')[1].split(',')[1]
        wav_obj = base64.b64decode(inp)
        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.wav'
        with open("{}/{}".format(dir, filename), "wb+") as f:
            f.write(wav_obj)
        return filename
