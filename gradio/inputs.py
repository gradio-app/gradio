"""
This module defines various classes that can serve as the `input` to an interface. Each class must inherit from
`AbstractInput`, and each class must define a path to its template. All of the subclasses of `AbstractInput` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

import datetime
import json
import os
import time
import warnings
from abc import ABC, abstractmethod

import base64
import numpy as np
import PIL.Image
import PIL.ImageOps
import scipy.io.wavfile
from gradio import preprocessing_utils

# Where to find the static resources associated with each template.
# BASE_INPUT_INTERFACE_TEMPLATE_PATH = 'static/js/interfaces/input/{}.js'
BASE_INPUT_INTERFACE_JS_PATH = 'static/js/interfaces/input/{}.js'


class AbstractInput(ABC):
    """
    An abstract class for defining the methods that all gradio inputs should have.
    When this is subclassed, it is automatically added to the registry
    """

    def __init__(self, label):
        self.label = label

    def get_template_context(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {"label": self.label}

    def preprocess(self, inp):
        """
        By default, no pre-processing is applied to text.
        """
        return inp

    def process_example(self, example):
        """
        Proprocess example for UI
        """
        return example

    @classmethod
    def get_shortcut_implementations(cls):
        """
        Return dictionary of shortcut implementations
        """
        return {}

    def rebuild(self, dir, data):
        """
        All interfaces should define a method that rebuilds the flagged input when it's passed back (i.e. rebuilds image from base64)
        """
        return data

class Textbox(AbstractInput):
    """
    Component creates a textbox for user to enter input. Provides a string (or number is `is_numeric` is true) as an argument to the wrapped function.
    Input type: str
    """

    def __init__(self, lines=1, placeholder=None, default=None, numeric=False, label=None):
        '''
        Parameters:
        lines (int): number of line rows to provide in textarea.
        placeholder (str): placeholder hint to provide behind textarea.
        default (str): default text to provide in textarea.
        numeric (bool): whether the input should be parsed as a number instead of a string.
        label (str): component name in interface.
        '''
        self.lines = lines
        self.placeholder = placeholder
        self.default = default
        self.numeric = numeric
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
            "number": {"numeric": True}
        }

    def preprocess(self, inp):
        """
        Cast type of input
        """
        if self.numeric:
            return float(inp)
        else:
            return inp


class Slider(AbstractInput):
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
        self.default = minimum if default is None else default
        super().__init__(label)

    def get_template_context(self):
        return {
            "minimum": self.minimum,
            "maximum": self.maximum,
            "default": self.default,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "slider": {},
        }


class Checkbox(AbstractInput):
    """
    Component creates a checkbox that can be set to `True` or `False`. Provides a boolean as an argument to the wrapped function.
    Input type: bool
    """

    def __init__(self, label=None):
        '''
        Parameters:
        label (str): component name in interface.
        '''
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "checkbox": {},
        }


class CheckboxGroup(AbstractInput):
    """
    Component creates a set of checkboxes of which a subset can be selected. Provides a list of strings representing the selected choices as an argument to the wrapped function.
    Input type: List[str]
    """

    def __init__(self, choices, label=None):
        '''
        Parameters:
        choices (List[str]): list of options to select from.
        label (str): component name in interface.
        '''
        self.choices = choices
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            **super().get_template_context()
        }


class Radio(AbstractInput):
    """
    Component creates a set of radio buttons of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.
    Input type: str
    """

    def __init__(self, choices, label=None):
        '''
        Parameters:
        choices (List[str]): list of options to select from.
        label (str): component name in interface.
        '''
        self.choices = choices
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            **super().get_template_context()
        }


class Dropdown(AbstractInput):
    """
    Component creates a dropdown of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.
    Input type: str
    """

    def __init__(self, choices, label=None):
        '''
        Parameters:
        choices (List[str]): list of options to select from.
        label (str): component name in interface.
        '''
        self.choices = choices
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            **super().get_template_context()
        }


class Image(AbstractInput):
    """
    Component creates an image upload box with editing capabilities. Provides numpy array of shape `(width, height, 3)` if `image_mode` is "RGB" as an argument to the wrapped function. Provides numpy array of shape `(width, height)` if `image_mode` is "L" as an argument to the wrapped function.
    Input type: numpy.array
    """

    def __init__(self, shape=None, image_mode='RGB', label=None):
        '''
        Parameters:
        shape (Tuple[int, int]): shape to crop and resize image to; if None, matches input image size.
        image_mode (str): "RGB" if color, or "L" if black and white.
        label (str): component name in interface.
        '''
        if shape is None:
            self.image_width, self.image_height = None, None
        else:
            self.image_width = shape[0]
            self.image_height = shape[1]
        self.image_mode = image_mode
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "image": {},
        }

    def get_template_context(self):
        return {
            **super().get_template_context()
        }

    def preprocess(self, inp):
        """
        Default preprocessing method for is to convert the picture to black and white and resize to be 48x48
        """
        im = preprocessing_utils.decode_base64_to_image(inp)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            im = im.convert(self.image_mode)
        image_width, image_height = self.image_width, self.image_height
        if image_width is None:
            image_width = im.size[0]
        if image_height is None:
            image_height = im.size[1]
        im = preprocessing_utils.resize_and_crop(
            im, (image_width, image_height))
        return np.array(im)

    def process_example(self, example):
        if os.path.exists(example):
            return preprocessing_utils.convert_file_to_base64(example)
        else:
            return example

    def rebuild(self, dir, data):
        """
        Default rebuild method to decode a base64 image
        """
        im = preprocessing_utils.decode_base64_to_image(data)
        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save(f'{dir}/{filename}', 'PNG')
        return filename


class Sketchpad(AbstractInput):
    """
    Component creates a sketchpad for black and white illustration. Provides numpy array of shape `(width, height)` as an argument to the wrapped function.
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
        self.image_width = shape[0]
        self.image_height = shape[1]
        self.invert_colors = invert_colors
        self.flatten = flatten
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "sketchpad": {},
        }

    def preprocess(self, inp):
        """
        Default preprocessing method for the SketchPad is to convert the sketch to black and white and resize 28x28
        """
        im_transparent = preprocessing_utils.decode_base64_to_image(inp)
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
        return preprocessing_utils.convert_file_to_base64(example)

    def rebuild(self, dir, data):
        """
        Default rebuild method to decode a base64 image
        """
        im = preprocessing_utils.decode_base64_to_image(data)
        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save(f'{dir}/{filename}', 'PNG')
        return filename


class Webcam(AbstractInput):
    """
    Component creates a webcam for captured image input. Provides numpy array of shape `(width, height, 3)` as an argument to the wrapped function.
    Input type: numpy.array
    """

    def __init__(self, shape=(224, 224), label=None):
        '''
        Parameters:
        shape (Tuple[int, int]): shape to crop and resize image to.
        label (str): component name in interface.
        '''
        self.image_width = shape[0]
        self.image_height = shape[1]
        self.num_channels = 3
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "webcam": {},
        }

    def preprocess(self, inp):
        """
        Default preprocessing method for is to convert the picture to black and white and resize to be 48x48
        """
        im = preprocessing_utils.decode_base64_to_image(inp)
        im = im.convert('RGB')
        im = preprocessing_utils.resize_and_crop(
            im, (self.image_width, self.image_height))
        return np.array(im)

    def rebuild(self, dir, data):
        """
        Default rebuild method to decode a base64 image
        """
        im = preprocessing_utils.decode_base64_to_image(data)
        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save('{}/{}'.format(dir, filename), 'PNG')
        return filename


class Microphone(AbstractInput):
    """
    Component creates a microphone element for audio inputs. Provides numpy array of shape `(samples, 2)` as an argument to the wrapped function.
    Input type: numpy.array
    """

    def __init__(self, preprocessing=None, label=None):
        '''
        Parameters:
        preprocessing (Union[str, Callable]): preprocessing to apply to input
        label (str): component name in interface.
        '''
        super().__init__(label)
        if preprocessing is None or preprocessing == "mfcc":
            self.preprocessing = preprocessing
        else:
            raise ValueError(
                "unexpected value for preprocessing", preprocessing)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "microphone": {},
        }

    def preprocess(self, inp):
        """
        By default, no pre-processing is applied to a microphone input file
        """
        file_obj = preprocessing_utils.decode_base64_to_wav_file(inp)
        if self.preprocessing == "mfcc":
            return preprocessing_utils.generate_mfcc_features_from_audio_file(file_obj.name)
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


# Automatically adds all shortcut implementations in AbstractInput into a dictionary.
shortcuts = {}
for cls in AbstractInput.__subclasses__():
    for shortcut, parameters in cls.get_shortcut_implementations().items():
        shortcuts[shortcut] = cls(**parameters)
