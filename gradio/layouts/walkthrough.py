from __future__ import annotations

from gradio_client.documentation import document

from gradio.component_meta import ComponentMeta

from .tabs import TabItem, Tabs


class Walkthrough(Tabs, metaclass=ComponentMeta):
    """
    Walkthrough is a layout element within Blocks that can contain multiple "Step" Components, which can be used to create a step-by-step workflow.
    """

    def get_block_name(self):
        return "walkthrough"


@document()
class WalkthroughStep(TabItem, metaclass=ComponentMeta):
    """
    WalkthroughStep is a layout element. A step is a single step in a step-by-step workflow.
    """

    def get_block_name(self):
        return "walkthroughstep"
