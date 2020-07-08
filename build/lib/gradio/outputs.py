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
from numbers import Number

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
    LABEL_KEY = "label"
    CONFIDENCE_KEY = "confidence"
    CONFIDENCES_KEY = "confidences"

    def __init__(self, num_top_classes=None, label=None):
        self.num_top_classes = num_top_classes
        super().__init__(label)

    def postprocess(self, prediction):
        if isinstance(prediction, str) or isinstance(prediction, Number):
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
                self.LABEL_KEY: sorted_pred[0][0],
                self.CONFIDENCES_KEY: [
                    {
                        self.LABEL_KEY: pred[0],
                        self.CONFIDENCE_KEY: pred[1]
                    } for pred in sorted_pred
                ]
            }
        elif isinstance(prediction, int) or isinstance(prediction, float):
            return {self.LABEL_KEY: str(prediction)}
        else:
            raise ValueError("The `Label` output interface expects one of: a string label, or an int label, a "
                             "float label, or a dictionary whose keys are labels and values are confidences.")

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "label": {},
        }


class KeyValues(AbstractOutput):
    def __init__(self, label=None):
        super().__init__(label)

    def postprocess(self, prediction):
        if isinstance(prediction, dict):
            return prediction
        else:
            raise ValueError("The `KeyValues` output interface expects an output that is a dictionary whose keys are "
                             "labels and values are corresponding values.")

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "key_values": {},
        }


class Textbox(AbstractOutput):
    def __init__(self, label=None):
        super().__init__(label)

    def get_template_context(self):
        return {
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "text": {},
            "number": {},
        }

    def postprocess(self, prediction):
        if isinstance(prediction, str) or isinstance(prediction, int) or isinstance(prediction, float):
            return str(prediction)
        else:
            raise ValueError("The `Textbox` output interface expects an output that is one of: a string, or"
                             "an int/float that can be converted to a string.")


class Image(AbstractOutput):
    def __init__(self, plot=False, label=None):
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
            try:
                return preprocessing_utils.encode_plot_to_base64(prediction)
            except:
                raise ValueError("The `Image` output interface expects a `matplotlib.pyplot` object"
                                 "if plt=True.")
        else:
            try:
                return preprocessing_utils.encode_array_to_base64(prediction)
            except:
                raise ValueError("The `Image` output interface (with plt=False) expects a numpy array.")

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
