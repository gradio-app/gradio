"""
This module defines various classes that can serve as the `output` to an interface. Each class must inherit from
`AbstractOutput`, and each class must define a path to its template. All of the subclasses of `AbstractOutput` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

from abc import ABC, abstractmethod
import numpy as np
import json

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

    @abstractmethod
    def get_template_path(self):
        """
        All interfaces should define a method that returns the path to its template.
        """
        pass

    @abstractmethod
    def postprocess(self, prediction):
        """
        All interfaces should define a default postprocessing method
        """
        pass


class Label(AbstractOutput):
    LABEL_KEY = 'label'
    CONFIDENCES_KEY = 'confidences'
    CONFIDENCE_KEY = 'confidence'

    def __init__(self, postprocessing_fn=None, num_top_classes=3, show_confidences=True):
        self.num_top_classes = num_top_classes
        self.show_confidences = show_confidences
        super().__init__(postprocessing_fn=postprocessing_fn)

    def get_template_path(self):
        return 'templates/label_output.html'

    def postprocess(self, prediction):
        """
        """
        response = dict()
        # TODO(abidlabs): check if list, if so convert to numpy array
        if isinstance(prediction, np.ndarray):
            prediction = prediction.squeeze()
            if prediction.size == 1:  # if it's single value
                response[Label.LABEL_KEY] = np.asscalar(prediction)
            elif len(prediction.shape) == 1:  # if a 1D
                response[Label.LABEL_KEY] = int(prediction.argmax())
                if self.show_confidences:
                    response[Label.CONFIDENCES_KEY] = []
                    for i in range(self.num_top_classes):
                        response[Label.CONFIDENCES_KEY].append({
                            Label.LABEL_KEY: int(prediction.argmax()),
                            Label.CONFIDENCE_KEY: float(prediction.max()),
                        })
                        prediction[prediction.argmax()] = 0
        elif isinstance(prediction, str):
            response[Label.LABEL_KEY] = prediction
        else:
            raise ValueError("Unable to post-process model prediction.")
        print(response)
        return json.dumps(response)


class Textbox(AbstractOutput):

    def get_template_path(self):
        return 'templates/textbox_output.html'

    def postprocess(self, prediction):
        """
        """
        return prediction


registry = {cls.__name__.lower(): cls for cls in AbstractOutput.__subclasses__()}
