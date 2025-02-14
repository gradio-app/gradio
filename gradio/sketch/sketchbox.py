from __future__ import annotations

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta

from gradio.events import Events

class SketchBox(BlockContext, metaclass=ComponentMeta):
    EVENTS = [Events.select]

    def __init__(self, is_container: bool = False):
        self.row = False
        self.is_container = is_container
        super().__init__()

    def __exit__(self, exc_type: type[BaseException] | None = None, *args):
        from gradio.layouts import Row

        self.row = isinstance(self.parent, Row)
        return super().__exit__(exc_type, *args)

    def get_config(self):
        from gradio.layouts import Row

        config = super().get_config()
        config["row"] = self.row
        return config
