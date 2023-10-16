"""gr.State() component."""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from gradio_client.documentation import document, set_documentation_group

from gradio.components.base import Component

set_documentation_group("component")


@document()
class State(Component):
    EVENTS = []
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
        try:
            self.value = deepcopy(value)
        except TypeError as err:
            raise TypeError(
                f"The initial value of `gr.State` must be able to be deepcopied. The initial value of type {type(value)} cannot be deepcopied."
            ) from err
        super().__init__(value=self.value, **kwargs)

    def preprocess(self, x: Any) -> Any:
        return x

    def postprocess(self, y):
        return y

    def api_info(self) -> dict[str, Any]:
        return {"type": {}, "description": "any valid json"}

    def example_inputs(self) -> Any:
        return None

    @property
    def skip_api(self):
        return True


class Variable(State):
    """Variable was renamed to State. This class is kept for backwards compatibility."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_block_name(self):
        return "state"
