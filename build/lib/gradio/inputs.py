from abc import ABC, abstractmethod
import base64
from PIL import Image
from io import BytesIO
import numpy as np
from gradio import preprocessing_utils

class AbstractInput(ABC):
    """
    An abstract class for defining the methods that all gradio inputs should have.
    When this is subclassed, it is automatically added to the registry
    """

    def __init__(self, preprocessing_fn=None):
        if preprocessing_fn is not None:
            self._pre_process = preprocessing_fn
        super().__init__()

    @abstractmethod
    def _get_template_path(self):
        """
        All interfaces should define a method that returns the path to its template.
        """
        pass

    @abstractmethod
    def _pre_process(self):
        """
        All interfaces should define a method that returns the path to its template.
        """
        pass


class Sketchpad(AbstractInput):

    def _get_template_path(self):
        return 'templates/sketchpad_input.html'

    def _pre_process(self, imgstring):
        """
        """
        content = imgstring.split(';')[1]
        image_encoded = content.split(',')[1]
        body = base64.decodebytes(image_encoded.encode('utf-8'))
        im = Image.open(BytesIO(base64.b64decode(image_encoded))).convert('L')
        im = preprocessing_utils.resize_and_crop(im, (28, 28))
        array = np.array(im).flatten().reshape(1, 28, 28, 1)
        return array


class Webcam(AbstractInput):

    def _get_template_path(self):
        return 'templates/webcam_input.html'

    def _pre_process(self, imgstring):
        """
        """
        content = imgstring.split(';')[1]
        image_encoded = content.split(',')[1]
        body = base64.decodebytes(image_encoded.encode('utf-8'))
        im = Image.open(BytesIO(base64.b64decode(image_encoded))).convert('L')
        im = preprocessing_utils.resize_and_crop(im, (48, 48))
        array = np.array(im).flatten().reshape(1, 48, 48, 1)
        return array

class Textbox(AbstractInput):

    def _get_template_path(self):
        return 'templates/textbox_input.html'

    def _pre_process(self, text):
        """
        """
        return text

class ImageUpload(AbstractInput):

    def _get_template_path(self):
        return 'templates/image_upload_input.html'

    def _pre_process(self, imgstring):
        """
        """
        content = imgstring.split(';')[1]
        image_encoded = content.split(',')[1]
        body = base64.decodebytes(image_encoded.encode('utf-8'))
        im = Image.open(BytesIO(base64.b64decode(image_encoded))).convert('L')
        im = preprocessing_utils.resize_and_crop(im, (48, 48))
        array = np.array(im).flatten().reshape(1, 48, 48, 1)
        return array


registry = {cls.__name__.lower(): cls for cls in AbstractInput.__subclasses__()}
