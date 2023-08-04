"""gr.State() component."""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import SimpleSerializable

from gradio.components.base import IOComponent

set_documentation_group("component")


@document()
class State(IOComponent, SimpleSerializable):
    """
    Special hidden component that stores session state across runs of the demo by the
    same user. The value of the State variable is cleared when the user refreshes the page.

    Preprocessing: No preprocessing is performed
    Postprocessing: No postprocessing is performed
    Demos: blocks_simple_squares
    Guides: real-time-speech-recognition
    """

    allow_string_shortcut = False

    def __init__(
        self,
        value: Any = None,
        **kwargs,
    ):
        """
        Parameters:
            value: the initial value (of arbitrary type) of the state. The provided argument is deepcopied. If a callable is provided, the function will be called whenever the app loads to set the initial value of the state.
        """
        self.stateful = True
        IOComponent.__init__(self, value=deepcopy(value), **kwargs)


class Variable(State):
    """Variable was renamed to State. This class is kept for backwards compatibility."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_block_name(self):
        return "state"
