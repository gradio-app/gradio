"""
This module defines various classes that can serve as the `output` to an interface. Each class must inherit from
`AbstractOutput`, and each class must define a path to its template. All of the subclasses of `AbstractOutput` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

from abc import ABC, abstractmethod
import numpy as np
import json
from gradio import imagenet_class_labels, preprocessing_utils
import datetime

# Where to find the static resources associated with each template.
BASE_OUTPUT_INTERFACE_TEMPLATE_PATH = 'templates/output/{}.html'
BASE_OUTPUT_INTERFACE_JS_PATH = 'static/js/interfaces/output/{}.js'


class AbstractOutput(ABC):
    """
    An abstract class for defining the methods that all gradio inputs should have.
    When this is subclassed, it is automatically added to the registry
    """

    def __init__(self, postprocessing_fn=None):
        """
        :param postprocessing_fn: an optional postprocessing function that overrides the default
        """
        if postprocessing_fn is not None:
            self.postprocess = postprocessing_fn
        super().__init__()

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

    @abstractmethod
    def get_name(self):
        """
        All outputs should define a method that returns a name used for identifying the related static resources.
        """
        pass

    @abstractmethod
    def postprocess(self, prediction):
        """
        All interfaces should define a default postprocessing method
        """
        pass

    @abstractmethod
    def rebuild_flagged(self, inp):
        """
        All interfaces should define a method that rebuilds the flagged output when it's passed back (i.e. rebuilds image from base64)
        """
        pass


class Label(AbstractOutput):
    LABEL_KEY = 'label'
    CONFIDENCES_KEY = 'confidences'
    CONFIDENCE_KEY = 'confidence'

    def __init__(self, postprocessing_fn=None, num_top_classes=3, show_confidences=True, label_names=None,
                 max_label_length=None, max_label_words=None, word_delimiter=" "):
        self.num_top_classes = num_top_classes
        self.show_confidences = show_confidences
        self.label_names = label_names
        self.max_label_length = max_label_length
        self.max_label_words = max_label_words
        self.word_delimiter = word_delimiter
        super().__init__(postprocessing_fn=postprocessing_fn)

    def get_name(self):
        return 'label'

    def get_label_name(self, label):
        if self.label_names is None:
            name = label
        elif self.label_names == 'imagenet1000':  # TODO:(abidlabs) better way to handle this
            name = imagenet_class_labels.NAMES1000[label]
        else:  # if list or dictionary
            name = self.label_names[label]
        if self.max_label_words is not None:
            name = name.split(self.word_delimiter)[:self.max_label_words]
            name = self.word_delimiter.join(name)
        if self.max_label_length is not None:
            name = name[:self.max_label_length]
        return name

    def postprocess(self, prediction):
        """
        """
        response = dict()
        # TODO(abidlabs): check if list, if so convert to numpy array
        if isinstance(prediction, np.ndarray):
            prediction = prediction.squeeze()
            if prediction.size == 1:  # if it's single value
                response[Label.LABEL_KEY] = self.get_label_name(np.asscalar(prediction))
            elif len(prediction.shape) == 1:  # if a 1D
                response[Label.LABEL_KEY] = self.get_label_name(int(prediction.argmax()))
                if self.show_confidences:
                    response[Label.CONFIDENCES_KEY] = []
                    for i in range(self.num_top_classes):
                        response[Label.CONFIDENCES_KEY].append({
                            Label.LABEL_KEY: self.get_label_name(int(prediction.argmax())),
                            Label.CONFIDENCE_KEY: float(prediction.max()),
                        })
                        prediction[prediction.argmax()] = 0
        elif isinstance(prediction, str):
            response[Label.LABEL_KEY] = prediction
        else:
            raise ValueError("Unable to post-process model prediction.")
        return json.dumps(response)

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method for label
        """
        out = msg['data']['output']
        return json.loads(out)


class Textbox(AbstractOutput):

    def get_name(self):
        return 'textbox'

    def postprocess(self, prediction):
        """
        """
        return prediction

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method for label
        """
        out = msg['data']['output']
        return json.loads(out)


class Image(AbstractOutput):

    def get_name(self):
        return 'image'

    def postprocess(self, prediction):
        """
        """
        return prediction

    def rebuild_flagged(self, dir, msg):
        """
        Default rebuild method to decode a base64 image
        """
        out = msg['data']['output']
        im = preprocessing_utils.encoding_to_image(out)
        timestamp = datetime.datetime.now()
        filename = f'output_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
        im.save(f'{dir}/{filename}', 'PNG')
        return filename


registry = {cls.__name__.lower(): cls for cls in AbstractOutput.__subclasses__()}
