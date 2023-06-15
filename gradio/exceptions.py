import warnings

from gradio_client.documentation import document, set_documentation_group
from typing_extensions import Literal

set_documentation_group("helpers")


class DuplicateBlockError(ValueError):
    """Raised when a Blocks contains more than one Block with the same id"""

    pass


class TooManyRequestsError(Exception):
    """Raised when the Hugging Face API returns a 429 status code."""

    pass


class InvalidApiNameError(ValueError):
    pass


InvalidApiName = InvalidApiNameError  # backwards compatibility


@document()
class Error(Exception):
    """
    This class allows you to pass custom error messages to the user. You can do so by raising a gr.Error("custom message") anywhere in the code, and when that line is executed the custom message will appear in a modal on the demo.

    Demos: calculator
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


def log_message(message: str, level: Literal["info", "warning"] = "info"):
    from gradio import queueing

    if not hasattr(queueing.thread_data, "blocks"):  # Function called outside of Gradio
        if level == "info":
            print(message)
        elif level == "warning":
            warnings.warn(message)
        return
    if not queueing.thread_data.blocks.enable_queue:
        warnings.warn(f"Queueing must be enabled to issue {level.capitalize()}: '{message}'.")
        return
    queueing.thread_data.blocks._queue.log_message(
        event_id=queueing.thread_data.event_id, log=message, level=level
    )


@document()
class Warning:
    """
    This class allows you to pass custom warning messages to the user. You can do so simply with `gr.Warning('message here')`, and when that line is executed the custom message will appear in a modal on the demo.
    """

    def __init__(self, message: str = "Warning issued."):
        """
        Parameters:
            message: The warning message to be displayed to the user.
        """
        log_message(message, level="warning")


@document()
class Info:
    """
    This class allows you to pass custom info messages to the user. You can do so simply with `gr.Info('message here')`, and when that line is executed the custom message will appear in a modal on the demo.
    """

    def __init__(self, message: str = "Info issued."):
        """
        Parameters:
            message: The info message to be displayed to the user.
        """
        log_message(message, level="info")
