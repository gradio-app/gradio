"""gr.StatusTracker() component."""
from gradio_client.serializing import SimpleSerializable

from gradio.components.base import Component
from gradio.deprecation import warn_deprecation


class StatusTracker(Component, SimpleSerializable):
    def __init__(
        self,
        **kwargs,
    ):
        warn_deprecation("The StatusTracker component is deprecated.")
