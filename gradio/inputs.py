"""
This module defines various classes that can serve as the `input` to an interface. Each class must inherit from
`AbstractInput`, and each class must define a path to its template. All of the subclasses of `AbstractInput` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

from abc import ABC, abstractmethod
import base64
from gradio import preprocessing_utils
from io import BytesIO
import numpy as np
from PIL import Image


class AbstractInput(ABC):
    """
    An abstract class for defining the methods that all gradio inputs should have.
    When this is subclassed, it is automatically added to the registry
    """

    def __init__(self, preprocessing_fn=None):
        """
        :param preprocessing_fn: an optional preprocessing function that overrides the default
        """
        if preprocessing_fn is not None:
            if not callable(preprocessing_fn):
                raise ValueError('`preprocessing_fn` must be a callable function')
            self.preprocess = preprocessing_fn
        super().__init__()

    @abstractmethod
    def get_template_path(self):
        """
        All interfaces should define a method that returns the path to its template.
        """
        pass

    @abstractmethod
    def preprocess(self, inp):
        """
        All interfaces should define a default preprocessing method
        """
        pass


class Sketchpad(AbstractInput):
    def __init__(self, preprocessing_fn=None, image_width=28, image_height=28):
        self.image_width = image_width
        self.image_height = image_height
        super().__init__(preprocessing_fn=preprocessing_fn)

    def get_template_path(self):
        return 'templates/sketchpad_input.html'

    def preprocess(self, inp):
        """
        Default preprocessing method for the SketchPad is to convert the sketch to black and white and resize 28x28
        """
        content = inp.split(';')[1]
        image_encoded = content.split(',')[1]
        im = Image.open(BytesIO(base64.b64decode(image_encoded))).convert('L')
        im = preprocessing_utils.resize_and_crop(im, (self.image_width, self.image_height))
        array = np.array(im).flatten().reshape(1, self.image_width, self.image_height, 1)
        return array


class Webcam(AbstractInput):
    def __init__(self, preprocessing_fn=None, image_width=224, image_height=224, num_channels=3):
        self.image_width = image_width
        self.image_height = image_height
        self.num_channels = num_channels
        super().__init__(preprocessing_fn=preprocessing_fn)

    def get_template_path(self):
        return 'templates/webcam_input.html'

    def preprocess(self, inp):
        """
        Default preprocessing method for is to convert the picture to black and white and resize to be 48x48
        """
        content = inp.split(';')[1]
        image_encoded = content.split(',')[1]
        im = Image.open(BytesIO(base64.b64decode(image_encoded))).convert('RGB')
        im = preprocessing_utils.resize_and_crop(im, (self.image_width, self.image_height))
        array = np.array(im).flatten().reshape(1, self.image_width, self.image_height, self.num_channels)
        return array


class Textbox(AbstractInput):

    def get_template_path(self):
        return 'templates/textbox_input.html'

    def preprocess(self, inp):
        """
        By default, no pre-processing is applied to text.
        """
        return inp


class ImageUpload(AbstractInput):
    def __init__(self, preprocessing_fn=None, image_width=229, image_height=229, num_channels=3, image_mode='RGB'):
        self.image_width = image_width
        self.image_height = image_height
        self.num_channels = num_channels
        self.image_mode = image_mode
        super().__init__(preprocessing_fn=preprocessing_fn)

    def get_template_path(self):
        return 'templates/image_upload_input.html'

    def preprocess(self, inp):
        """
        Default preprocessing method for is to convert the picture to black and white and resize to be 48x48
        """
        content = inp.split(';')[1]
        image_encoded = content.split(',')[1]
        im = Image.open(BytesIO(base64.b64decode(image_encoded))).convert(self.image_mode)
        im = preprocessing_utils.resize_and_crop(im, (self.image_width, self.image_height))
        if self.num_channels is None:
            array = np.array(im).flatten().reshape(1, self.image_width, self.image_height)
        else:
            array = np.array(im).flatten().reshape(1, self.image_width, self.image_height, self.num_channels)
        return array


# Automatically adds all subclasses of AbstractInput into a dictionary (keyed by class name) for easy referencing.
registry = {cls.__name__.lower(): cls for cls in AbstractInput.__subclasses__()}
