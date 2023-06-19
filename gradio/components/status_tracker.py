"""gr.StatusTracker() component."""

import warnings

from gradio_client.serializing import SimpleSerializable

from gradio.components.base import Component


class StatusTracker(Component, SimpleSerializable):
    def __init__(
        self,
        **kwargs,
    ):
        warnings.warn("The StatusTracker component is deprecated.")
