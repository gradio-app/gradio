from __future__ import annotations

from gradio_client.documentation import document

from gradio.component_meta import ComponentMeta

from .tabs import TabItem, Tabs


class Stepper(Tabs, metaclass=ComponentMeta):
    """
    Stepper is a layout element within Blocks that can contain multiple "Step" Components, which can be used to create a step-by-step workflow.
    """

    def get_block_name(self):
        return "stepper"


@document()
class Step(TabItem, metaclass=ComponentMeta):
    """
    Step is a layout element. A step is a single step in a step-by-step workflow.
    """

    def get_block_name(self):
        return "step"
