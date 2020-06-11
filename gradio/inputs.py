"""
This module defines various classes that can serve as the `input` to an interface. Each class must inherit from
`AbstractInput`, and each class must define a path to its template. All of the subclasses of `AbstractInput` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

from abc import ABC, abstractmethod
from gradio import preprocessing_utils, validation_data
import numpy as np
from PIL import Image, ImageOps
import time
import warnings
import json
import datetime

# Where to find the static resources associated with each template.
# BASE_INPUT_INTERFACE_TEMPLATE_PATH = 'static/js/interfaces/input/{}.js'
BASE_INPUT_INTERFACE_JS_PATH = 'static/js/interfaces/input/{}.js'


class AbstractInput(ABC):
    """
    An abstract class for defining the methods that all gradio inputs should have.
    When this is subclassed, it is automatically added to the registry
    """

    def get_validation_inputs(self):
        """
        An interface can optionally implement a method that returns a list of examples inputs that it should be able to
        accept and preprocess for validation purposes.
        """
        return []

    def get_js_context(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {}

    def get_template_context(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {}

    def sample_inputs(self):
        """
        An interface can optionally implement a method that sends a list of sample inputs for inference.
        """
        return []

    @abstractmethod
    def get_name(self):
        """
        All interfaces should define a method that returns a name used for identifying the related static resources.
        """
        pass

    @abstractmethod
    def preprocess(self, inp):
        """
        All interfaces should define a default preprocessing method
        """
        pass

    @abstractmethod
    def rebuild_flagged(self, dir, msg):
        """
        All interfaces should define a method that rebuilds the flagged input when it's passed back (i.e. rebuilds image from base64)
        """
        pass


class Sketchpad(AbstractInput):
    def __init__(self, shape=(28, 28), invert_colors=True, flatten=False, scale=1/255, shift=0,
                 dtype='float64', sample_inputs=None):
        self.image_width = shape[0]
        self.image_height = shape[1]
        self.invert_colors = invert_colors
        self.flatten = flatten
        self.scale = scale
        self.shift = shift
        self.dtype = dtype
        self.sample_inputs = sample_inputs
        super().__init__()

    def get_name(self):
        return 'sketchpad'

    def preprocess(self, inp):
        """
        Default preprocessing method for the SketchPad is to convert the sketch to black and white and resize 28x28
        """
        im_transparent = preprocessing_utils.decode_base64_to_image(inp)
        im = Image.new("RGBA", im_transparent.size, "WHITE")  # Create a white background for the alpha channel
        im.paste(im_transparent, (0, 0), im_transparent)
        im = im.convert('L')
        if self.invert_colors:
            im = ImageOps.invert(im)
        im = im.resize((self.image_width, self.image_height))
        if self.flatten:
            array = np.array(im).flatten().reshape(1, self.image_width * self.image_height)
        else:
            array = np.array(im).flatten().reshape(1, self.image_width, self.image_height)
        array = array * self.scale + self.shift
        array = array.astype(self.dtype)
        return array

    # TODO(abidlabs): clean this up
    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method to decode a base64 image
        """

        im = preprocessing_utils.decode_base64_to_image(msg)

        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save(f'{dir}/{filename}', 'PNG')
        return filename

    def get_sample_inputs(self):
        encoded_images = []
        if self.sample_inputs is not None:
            for input in self.sample_inputs:
                if self.flatten:
                    input = input.reshape((self.image_width, self.image_height))
                if self.invert_colors:
                    input = 1 - input
                encoded_images.append(preprocessing_utils.encode_array_to_base64(input))
        return encoded_images


class Webcam(AbstractInput):
    def __init__(self, image_width=224, image_height=224, num_channels=3):
        self.image_width = image_width
        self.image_height = image_height
        self.num_channels = num_channels
        super().__init__()

    def get_validation_inputs(self):
        return validation_data.BASE64_COLOR_IMAGES

    def get_name(self):
        return 'webcam'

    def preprocess(self, inp):
        """
        Default preprocessing method for is to convert the picture to black and white and resize to be 48x48
        """
        im = preprocessing_utils.decode_base64_to_image(inp)
        im = im.convert('RGB')
        im = preprocessing_utils.resize_and_crop(im, (self.image_width, self.image_height))
        array = np.array(im).flatten().reshape(self.image_width, self.image_height, self.num_channels)
        return array

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method to decode a base64 image
        """
        inp = msg['data']['input']
        im = preprocessing_utils.decode_base64_to_image(inp)
        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save(f'{dir}/{filename}', 'PNG')
        return filename


class Textbox(AbstractInput):
    def __init__(self, sample_inputs=None, lines=None, placeholder=None):
        self.sample_inputs = sample_inputs
        self.lines = lines
        self.placeholder = placeholder
        super().__init__()

    def get_validation_inputs(self):
        return validation_data.ENGLISH_TEXTS

    def get_name(self):
        return 'textbox'

    def get_template_context(self):
        return {
            "lines": self.lines,
            "placeholder": self.placeholder,
        }

    def preprocess(self, inp):
        """
        By default, no pre-processing is applied to text.
        """
        return inp

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method for text saves it .txt file
        """
        return json.loads(msg)

    def get_sample_inputs(self):
        return self.sample_inputs


class ImageIn(AbstractInput):
    def __init__(self, shape=(224, 224, 3), image_mode='RGB',
                 scale=1/127.5, shift=-1, cropper_aspect_ratio=None):
        self.image_width = shape[0]
        self.image_height = shape[1]
        self.num_channels = shape[2]
        self.image_mode = image_mode
        self.scale = scale
        self.shift = shift
        self.cropper_aspect_ratio = "false" if cropper_aspect_ratio is None else cropper_aspect_ratio
        super().__init__()

    def get_validation_inputs(self):
        return validation_data.BASE64_COLOR_IMAGES

    def get_name(self):
        return 'image'

    def get_js_context(self):
        return {'aspect_ratio': self.cropper_aspect_ratio}

    def preprocess(self, inp):
        """
        Default preprocessing method for is to convert the picture to black and white and resize to be 48x48
        """
        im = preprocessing_utils.decode_base64_to_image(inp)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            im = im.convert(self.image_mode)

        im = preprocessing_utils.resize_and_crop(im, (self.image_width, self.image_height))
        im = np.array(im).flatten()
        im = im * self.scale + self.shift
        if self.num_channels is None:
            array = im.reshape(self.image_width, self.image_height)
        else:
            array = im.reshape(self.image_width, self.image_height, self.num_channels)
        return array

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method to decode a base64 image
        """
        im = preprocessing_utils.decode_base64_to_image(msg)
        timestamp = datetime.datetime.now()
        filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save(f'{dir}/{filename}', 'PNG')
        return filename

    # TODO(abidlabs): clean this up
    def save_to_file(self, dir, img):
        """
        """
        timestamp = time.time()*1000
        filename = 'input_{}.png'.format(timestamp)
        img.save('{}/{}'.format(dir, filename), 'PNG')
        return filename


class CSV(AbstractInput):

    def get_name(self):
        return 'csv'

    def preprocess(self, inp):
        """
        By default, no pre-processing is applied to a CSV file (TODO:aliabid94 fix this)
        """
        return inp

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method for csv
        """
        return json.loads(msg)


class Microphone(AbstractInput):

    def get_name(self):
        return 'microphone'

    def preprocess(self, inp):
        """
        By default, no pre-processing is applied to a microphone input file
        """
        file_obj = preprocessing_utils.decode_base64_to_wav_file(inp)
        mfcc_array = preprocessing_utils.generate_mfcc_features_from_audio_file(file_obj.name)
        return mfcc_array

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method for csv
        """
        return json.loads(msg)


# Automatically adds all subclasses of AbstractInput into a dictionary (keyed by class name) for easy referencing.
registry = {cls.__name__.lower(): cls for cls in AbstractInput.__subclasses__()}
