class SerializationSetupError(ValueError):
    """Raised when a serializers cannot be set up correctly."""

    pass


class AuthenticationError(ValueError):
    """Raised when the client is unable to authenticate itself to a Gradio app due to invalid or missing credentials."""

    pass


class AppError(ValueError):
    """Raised when the upstream Gradio app throws an error because of the value submitted by the client."""
