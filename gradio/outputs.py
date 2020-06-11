"""
This module defines various classes that can serve as the `output` to an interface. Each class must inherit from
`AbstractOutput`, and each class must define a path to its template. All of the subclasses of `AbstractOutput` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

from abc import ABC, abstractmethod
import numpy as np
import json
from gradio import preprocessing_utils
import datetime

# Where to find the static resources associated with each template.
BASE_OUTPUT_INTERFACE_JS_PATH = 'static/js/interfaces/output/{}.js'


class AbstractOutput(ABC):
    """
    An abstract class for defining the methods that all gradio inputs should have.
    When this is subclassed, it is automatically added to the registry
    """

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
    
    def postprocess(self, prediction):
        """
        Any postprocessing needed to be performed on function output.
        """
        return prediction

    @abstractmethod
    def get_name(self):
        """
        All outputs should define a method that returns a name used for identifying the related static resources.
        """
        pass

    @abstractmethod
    def rebuild_flagged(self, inp):
        """
        All interfaces should define a method that rebuilds the flagged output when it's passed back (i.e. rebuilds image from base64)
        """
        pass

import operator
class Label(AbstractOutput):
    def __init__(self, num_top_classes=None):
        self.num_top_classes = num_top_classes
        super().__init__()

    def get_name(self):
        return 'label'

    def postprocess(self, prediction):
        if isinstance(prediction, str):
            return {"label": str}
        elif isinstance(prediction, dict):
            sorted_pred = sorted(
                prediction.items(), 
                key=operator.itemgetter(1),
                reverse=True
            )
            if self.num_top_classes is not None:
                sorted_pred = sorted_pred[:self.num_top_classes]
            return {
                "label": sorted_pred[0][0],
                "confidences": [
                    {
                        "label": pred[0],
                        "confidence" : pred[1]
                    } for pred in sorted_pred
                ]
            }
        else:
            raise ValueError("Function output should be string or dict")

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method for label
        """
        return json.loads(msg)


class Textbox(AbstractOutput):
    def __init__(self, lines=None, placeholder=None):
        self.lines = lines
        self.placeholder = placeholder
        super().__init__()

    def get_name(self):
        return 'textbox'

    def get_template_context(self):
        return {
            "lines": self.lines,
            "placeholder": self.placeholder,
        }

    def postprocess(self, prediction):
        """
        """
        return prediction

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method for label
        """
        return json.loads(msg)


class Image(AbstractOutput):

    def get_name(self):
        return 'image'

    def postprocess(self, prediction):
        """
        """
        print(prediction.shape)
        return preprocessing_utils.encode_array_to_base64(prediction)

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method to decode a base64 image
        """
        im = preprocessing_utils.decode_base64_to_image(msg)
        timestamp = datetime.datetime.now()
        filename = 'output_{}.png'.format(timestamp.
                                          strftime("%Y-%m-%d-%H-%M-%S"))
        im.save('{}/{}'.format(dir, filename), 'PNG')
        return filename


registry = {cls.__name__.lower(): cls for cls in AbstractOutput.__subclasses__()}
