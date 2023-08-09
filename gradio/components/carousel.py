"""gr.Carousel() component."""

from gradio_client.serializing import SimpleSerializable

from gradio.components.base import Component
from gradio.events import Changeable


class Carousel(Changeable, SimpleSerializable, Component):
    """
    Deprecated Component
    """

    def __init__(
        self,
        *args,
        **kwargs,
    ):
        raise DeprecationWarning(
            "The Carousel component is deprecated. Please consider using the Gallery "
            "component, which can be used to display images (and optional captions).",
        )
