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

    def rebuild(self, dir, data):
        """
        All interfaces should define a method that rebuilds the flagged input when it's passed back (i.e. rebuilds image from base64)
        """
        return data


class Textbox(AbstractOutput):
    '''
    Component creates a textbox to render output text or number.
    Output type: str
    '''

    def __init__(self, label=None):
        '''
        Parameters:
        label (str): component name in interface.
        '''
        super().__init__(label)

    def get_template_context(self):
        return {
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "text": {},
            "textbox": {},
            "number": {},
        }

    def postprocess(self, prediction):
        if isinstance(prediction, str) or isinstance(prediction, int) or isinstance(prediction, float):
            return str(prediction)
        else:
            raise ValueError("The `Textbox` output interface expects an output that is one of: a string, or"
                             "an int/float that can be converted to a string.")


class Label(AbstractOutput):
    '''
    Component outputs a classification label, along with confidence scores of top categories if provided. Confidence scores are represented as a dictionary mapping labels to scores between 0 and 1.
    Output type: Union[Dict[str, float], str, int, float]
    '''

    LABEL_KEY = "label"
    CONFIDENCE_KEY = "confidence"
    CONFIDENCES_KEY = "confidences"

    def __init__(self, num_top_classes=None, label=None):
        '''
        Parameters:
        num_top_classes (int): number of most confident classes to show.
        label (str): component name in interface.
        '''
        self.num_top_classes = num_top_classes
        super().__init__(label)

    def postprocess(self, prediction):
        if isinstance(prediction, str) or isinstance(prediction, Number):
            return {"label": str(prediction)}
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

    def rebuild(self, dir, data):
        """
        Default rebuild method for label
        """
        return json.loads(data)

class Image(AbstractOutput):
    '''
    Component displays an image. Expects a numpy array of shape `(width, height, 3)` to be returned by the function, or a `matplotlib.pyplot` if `plot = True`.
    Output type: numpy.array
    '''

    def __init__(self, plot=False, label=None):
        '''
        Parameters:
        plot (bool): whether to expect a plot to be returned by the function.
        label (str): component name in interface.
        '''
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
                raise ValueError(
                    "The `Image` output interface (with plt=False) expects a numpy array.")

    def rebuild(self, dir, data):
        """
        Default rebuild method to decode a base64 image
        """
        im = preprocessing_utils.decode_base64_to_image(data)
        timestamp = datetime.datetime.now()
        filename = 'output_{}.png'.format(timestamp.
                                          strftime("%Y-%m-%d-%H-%M-%S"))
        im.save('{}/{}'.format(dir, filename), 'PNG')
        return filename


class KeyValues(AbstractOutput):
    '''
    Component displays a table representing values for multiple fields. 
    Output type: Dict[str, value]
    '''

    def __init__(self, label=None):
        '''
        Parameters:
        label (str): component name in interface.
        '''
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


class HighlightedText(AbstractOutput):
    '''
    Component creates text that contains spans that are highlighted by category or numerical value.
    Output is represent as a list of Tuple pairs, where the first element represents the span of text represented by the tuple, and the second element represents the category or value of the text.
    Output type: List[Tuple[str, Union[float, str]]]
    '''

    def __init__(self, category_colors=None, label=None):
        '''
        Parameters:
        category_colors (Dict[str, float]): 
        label (str): component name in interface.
        '''
        super().__init__(label)

    def get_template_context(self):
        return {
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "highlight": {},
        }

    def postprocess(self, prediction):
        if isinstance(prediction, str) or isinstance(prediction, int) or isinstance(prediction, float):
            return str(prediction)
        else:
            raise ValueError("The `HighlightedText` output interface expects an output that is one of: a string, or"
                             "an int/float that can be converted to a string.")


class JSON(AbstractOutput):
    '''
    Used for JSON output. Expects a JSON string or a Python dictionary or list that can be converted to JSON. 
    Output type: Union[str, Dict[str, Any], List[Any]]
    '''

    def __init__(self, label=None):
        '''
        Parameters:
        label (str): component name in interface.
        '''
        super().__init__(label)

    def postprocess(self, prediction):
        if isinstance(prediction, dict) or isinstance(prediction, list):
            return json.dumps(prediction)
        elif isinstance(prediction, str):
            return prediction
        else:
            raise ValueError("The `JSON` output interface expects an output that is a dictionary or list "
                             "or a preformatted JSON string.")

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "json": {},
        }


class HTML(AbstractOutput):
    '''
    Used for HTML output. Expects a JSON string or a Python dictionary or list that can be converted to JSON. 
    Output type: str
    '''

    def __init__(self, label=None):
        '''
        Parameters:
        label (str): component name in interface.
        '''
        super().__init__(label)

    def postprocess(self, prediction):
        if isinstance(prediction, str):
            return prediction
        else:
            raise ValueError("The `HTML` output interface expects an output that is a str.")

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "html": {},
        }


# Automatically adds all shortcut implementations in AbstractInput into a dictionary.
shortcuts = {}
for cls in AbstractOutput.__subclasses__():
    for shortcut, parameters in cls.get_shortcut_implementations().items():
        shortcuts[shortcut] = cls(**parameters)
