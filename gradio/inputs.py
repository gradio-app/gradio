"""
This module defines various classes that can serve as the `input` to an interface. Each class must inherit from
`AbstractInput`, and each class must define a path to its template. All of the subclasses of `AbstractInput` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

from abc import ABC, abstractmethod
from gradio import preprocessing_utils, validation_data
import numpy as np
import PIL.Image, PIL.ImageOps
import time
import warnings
import json
import datetime
import os

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

    def get_validation_inputs(self):
        """
        An interface can optionally implement a method that returns a list of examples inputs that it should be able to
        accept and preprocess for validation purposes.
        """
        return []

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


class Sketchpad(AbstractInput):
    def __init__(self, shape=(28, 28), invert_colors=True,
                 flatten=False, label=None):
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
        im = PIL.Image.new("RGBA", im_transparent.size, "WHITE")  # Create a white background for the alpha channel
        im.paste(im_transparent, (0, 0), im_transparent)
        im = im.convert('L')
        if self.invert_colors:
            im = PIL.ImageOps.invert(im)
        im = im.resize((self.image_width, self.image_height))
        if self.flatten:
            array = np.array(im).flatten().reshape(1, self.image_width * self.image_height)
        else:
            array = np.array(im).flatten().reshape(1, self.image_width, self.image_height)
        return array

    def process_example(self, example):
        return preprocessing_utils.convert_file_to_base64(example)


class Webcam(AbstractInput):
    def __init__(self, shape=(224, 224), label=None):
        self.image_width = shape[0]
        self.image_height = shape[1]
        self.num_channels = 3
        super().__init__(label)

    def get_validation_inputs(self):
        return validation_data.BASE64_COLOR_IMAGES

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
        im = preprocessing_utils.resize_and_crop(im, (self.image_width, self.image_height))
        return np.array(im)


class Textbox(AbstractInput):
    def __init__(self, lines=1, placeholder=None, default=None, numeric=False, label=None):
        self.lines = lines
        self.placeholder = placeholder
        self.default = default
        self.numeric = numeric
        super().__init__(label)

    def get_validation_inputs(self):
        return validation_data.ENGLISH_TEXTS

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


class Radio(AbstractInput):
    def __init__(self, choices, label=None):
        self.choices = choices
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            **super().get_template_context()
        }


class Dropdown(AbstractInput):
    def __init__(self, choices, label=None):
        self.choices = choices
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            **super().get_template_context()
        }


class CheckboxGroup(AbstractInput):
    def __init__(self, choices, label=None):
        self.choices = choices
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            **super().get_template_context()
        }


class Slider(AbstractInput):
    def __init__(self, minimum=0, maximum=100, default=None, label=None):
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
    def __init__(self, label=None):
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "checkbox": {},
        }


class Image(AbstractInput):
    def __init__(self, shape=(224, 224), image_mode='RGB', label=None):
        self.image_width = shape[0]
        self.image_height = shape[1]
        self.image_mode = image_mode
        super().__init__(label)

    def get_validation_inputs(self):
        return validation_data.BASE64_COLOR_IMAGES

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

        im = preprocessing_utils.resize_and_crop(im, (self.image_width, self.image_height))
        return np.array(im)

    def process_example(self, example):
        if os.path.exists(example):
            return preprocessing_utils.convert_file_to_base64(example)
        else:
            return example


class Microphone(AbstractInput):
    def __init__(self, label=None):
        super().__init__(label)

    def preprocess(self, inp):
        """
        By default, no pre-processing is applied to a microphone input file
        """
        file_obj = preprocessing_utils.decode_base64_to_wav_file(inp)
        mfcc_array = preprocessing_utils.generate_mfcc_features_from_audio_file(file_obj.name)
        return mfcc_array


# Automatically adds all shortcut implementations in AbstractInput into a dictionary.
shortcuts = {}
for cls in AbstractInput.__subclasses__():
    for shortcut, parameters in cls.get_shortcut_implementations().items():
        shortcuts[shortcut] = cls(**parameters)