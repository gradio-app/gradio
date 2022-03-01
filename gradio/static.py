from __future__ import annotations

from gradio.component import Component


class StaticComponent(Component):
    def __init__(self, label: str):
        self.component_type = "static"
        super().__init__(label)

    def process(self, y):
        """
        Any processing needed to be performed on the default value.
        """
        return y


class Markdown(StaticComponent):
    pass


class Button(StaticComponent):
    pass
