from gradio_client.documentation import document


class DuplicateBlockError(ValueError):
    """Raised when a Blocks contains more than one Block with the same id"""

    pass


class InvalidComponentError(ValueError):
    """Raised when invalid components are used."""

    pass


class TooManyRequestsError(Exception):
    """Raised when the Hugging Face API returns a 429 status code."""

    pass


class ModelNotFoundError(Exception):
    """Raised when the provided model doesn't exists or is not found by the provided api url."""

    pass


class RenderError(Exception):
    """Raised when a component has not been rendered in the current Blocks but is expected to have been rendered."""

    pass


class InvalidApiNameError(ValueError):
    pass


class ServerFailedToStartError(Exception):
    pass


class InvalidBlockError(ValueError):
    """Raised when an event in a Blocks contains a reference to a Block that is not in the original Blocks"""

    pass


class ReloadError(ValueError):
    """Raised when something goes wrong when reloading the gradio app."""

    pass


class GradioVersionIncompatibleError(Exception):
    """Raised when loading a 3.x space with 4.0"""

    pass


InvalidApiName = InvalidApiNameError  # backwards compatibility


@document(documentation_group="modals")
class Error(Exception):
    """
    This class allows you to pass custom error messages to the user. You can do so by raising a gr.Error("custom message") anywhere in the code, and when that line is executed the custom message will appear in a modal on the demo.
    Example:
        import gradio as gr
        def divide(numerator, denominator):
            if denominator == 0:
                raise gr.Error("Cannot divide by zero!")
        gr.Interface(divide, ["number", "number"], "number").launch()
    Demos: calculator, blocks_chained_events
    """

    def __init__(self, message: str = "Error raised."):
        """
        Parameters:
            message: The error message to be displayed to the user.
        """
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return repr(self.message)


class ComponentDefinitionError(NotImplementedError):
    pass
