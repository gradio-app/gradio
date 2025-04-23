from __future__ import annotations

from gradio_client.documentation import document
from gradio_client.exceptions import AppError


class DuplicateBlockError(ValueError):
    """Raised when a Blocks contains more than one Block with the same id"""

    pass


class InvalidComponentError(ValueError):
    """Raised when invalid components are used."""

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
class Error(AppError):
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

    def __init__(
        self,
        message: str = "Error raised.",
        duration: float | None = 10,
        visible: bool = True,
        title: str = "Error",
        print_exception: bool = True,
    ):
        """
        Parameters:
            message: The error message to be displayed to the user. Can be HTML, which will be rendered in the modal.
            duration: The duration in seconds to display the error message. If None or 0, the error message will be displayed until the user closes it.
            visible: Whether the error message should be displayed in the UI.
            title: The title to be displayed to the user at the top of the error modal.
            print_exception: Whether to print traceback of the error to the console when the error is raised.
        """
        super().__init__(
            message=message,
            duration=duration,
            visible=visible,
            title=title,
            print_exception=print_exception,
        )

    def __str__(self):
        return repr(self.message)


class ComponentDefinitionError(NotImplementedError):
    pass


class InvalidPathError(ValueError):
    pass


class ChecksumMismatchError(Exception):
    pass


class TooManyRequestsError(Error):
    """Raised when the Hugging Face API returns a 429 status code."""

    def __init__(self, message: str = "Too many requests. Please try again later."):
        super().__init__(message)
