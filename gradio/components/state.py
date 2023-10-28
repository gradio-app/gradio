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
        render: bool = True,
    ):
        """
        Parameters:
            value: the initial value (of arbitrary type) of the state. The provided argument is deepcopied. If a callable is provided, the function will be called whenever the app loads to set the initial value of the state.
            render: has no effect, but is included for consistency with other components.
        """
        self.stateful = True
        try:
            self.value = deepcopy(value)
        except TypeError as err:
            raise TypeError(
                f"The initial value of `gr.State` must be able to be deepcopied. The initial value of type {type(value)} cannot be deepcopied."
            ) from err
        super().__init__(value=self.value)

    def preprocess(self, payload: Any) -> Any:
        return payload

    def postprocess(self, value: Any) -> Any:
        return value

    def api_info(self) -> dict[str, Any]:
        return {"type": {}, "description": "any valid json"}

    def example_inputs(self) -> Any:
        return None

    @property
    def skip_api(self):
        return True
