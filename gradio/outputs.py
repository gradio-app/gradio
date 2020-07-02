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
import operator

# Where to find the static resources associated with each template.
BASE_OUTPUT_INTERFACE_JS_PATH = 'static/js/interfaces/output/{}.js'


class AbstractOutput(ABC):
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

    def postprocess(self, prediction):
        """
        Any postprocessing needed to be performed on function output.
        """
        return prediction

    @classmethod
    def get_shortcut_implementations(cls):
        """
        Return dictionary of shortcut implementations
        """
        return {}

class Label(AbstractOutput):
    def __init__(self, num_top_classes=None, label=None):
        self.num_top_classes = num_top_classes
        super().__init__(label)

    def postprocess(self, prediction):
        if isinstance(prediction, str):
            return {"label": prediction}
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

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "label": {},
        }


class KeyValues(AbstractOutput):
    def __init__(self, label=None):
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "key_values": {},
        }


class Textbox(AbstractOutput):
    def __init__(self, lines=1, placeholder=None, label=None):
        self.lines = lines
        self.placeholder = placeholder
        super().__init__(label)

    def get_template_context(self):
        return {
            "lines": self.lines,
            "placeholder": self.placeholder,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "text": {},
            "number": {},
            "textbox": {"lines": 7}
        }

    def postprocess(self, prediction):
        """
        """
        return prediction


class Image(AbstractOutput):
    def __init__(self, label=None, plot=False):
        self.plot = plot
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "image": {},
            "plot": {"plot": True}
        }

    def postprocess(self, prediction):
        """
        """
        if self.plot:
            return preprocessing_utils.encode_plot_to_base64(prediction)
        else:
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


# Automatically adds all shortcut implementations in AbstractInput into a dictionary.
shortcuts = {}
for cls in AbstractOutput.__subclasses__():
    for shortcut, parameters in cls.get_shortcut_implementations().items():
        shortcuts[shortcut] = cls(**parameters)
