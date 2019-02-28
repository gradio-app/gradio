from abc import ABC, abstractmethod
import numpy as np


class AbstractOutput(ABC):
    """
    An abstract class for defining the methods that all gradio inputs should have.
    When this is subclassed, it is automatically added to the registry
    """

    def __init__(self, postprocessing_fn=None):
        """
        """
        if postprocessing_fn is not None:
            self._postprocess = postprocessing_fn
        super().__init__()

    @abstractmethod
    def _get_template_path(self):
        """
        All interfaces should define a method that returns the path to its template.
        """
        pass

    @abstractmethod
    def _postprocess(self, prediction):
        """
        All interfaces should define a default postprocessing method
        """
        pass


class Label(AbstractOutput):

    def _get_template_path(self):
        return 'templates/label_output.html'

    def _postprocess(self, prediction):
        """
        """
        if isinstance(prediction, np.ndarray):
            prediction = prediction.squeeze()
            if prediction.size == 1:
                return prediction
            else:
                return prediction.argmax()
        elif isinstance(prediction, str):
            return prediction
        else:
            raise ValueError("Unable to post-process model prediction.")


class Textbox(AbstractOutput):

    def _get_template_path(self):
        return 'templates/textbox_output.html'

    def _postprocess(self, prediction):
        """
        """
        return prediction


registry = {cls.__name__.lower(): cls for cls in AbstractOutput.__subclasses__()}
