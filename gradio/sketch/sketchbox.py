from __future__ import annotations

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta
from gradio.events import Events


class SketchBox(BlockContext, metaclass=ComponentMeta):
    EVENTS = [Events.select]

    def __init__(
        self,
        is_container: bool = False,
        component_type: str | None = None,
        var_name: str | None = None,
        active: bool = False,
    ):
        self.row = False
        self.is_container = is_container
        self.component_type = component_type
        self.var_name = var_name
        self.active = active
        super().__init__()

    def __exit__(self, exc_type: type[BaseException] | None = None, *args):
        from gradio.layouts import Row

        self.row = isinstance(self.parent, Row)
        return super().__exit__(exc_type, *args)

    def get_config(self):
        config = super().get_config()
        config["row"] = self.row
        return config
