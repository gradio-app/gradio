from __future__ import annotations

<<<<<<< HEAD
from gradio.component import Component
=======
from gradio.components import Component
>>>>>>> Blocks-Components


class StaticComponent(Component):
    def __init__(self, label: str):
        self.component_type = "static"
<<<<<<< HEAD
        super().__init__(label)
=======
        super().__init__(label=label)
>>>>>>> Blocks-Components

    def process(self, y):
        """
        Any processing needed to be performed on the default value.
        """
        return y


class Markdown(StaticComponent):
    pass


class Button(StaticComponent):
    pass
