class SerializationSetupError(ValueError):
    """Raised when a serializers cannot be set up correctly."""

    pass


class AuthenticationError(ValueError):
    """Raised when the client is unable to authenticate itself to a Gradio app due to invalid or missing credentials."""

    pass


class AppError(ValueError):
    """Raised when the upstream Gradio app throws an error because of the value submitted by the client."""

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
        self.title = title
        self.message = message
        self.duration = duration
        self.visible = visible
        self.print_exception = print_exception
        super().__init__(self.message)
