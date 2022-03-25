from __future__ import annotations

import os
from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

from gradio import utils
from gradio.context import Context
from gradio.launchable import Launchable

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component


class Block:
    def __init__(self):
        self.render()

    def render(self):
        """
        Adds self into appropriate BlockContext
        """
        self._id = Context.id
        Context.id += 1
        if Context.block is not None:
            Context.block.children.append(self)
        if Context.root_block is not None:
            Context.root_block.blocks[self._id] = self
        self.events = []

    def set_event_trigger(
        self,
        event_name: str,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
    ) -> None:
        """
        Adds an event to the component's dependencies.
        Parameters:
            event_name: event name
            fn: Callable function
            inputs: input list
            outputs: output list
        Returns: None
        """
        # Support for singular parameter
        if not isinstance(inputs, list):
            inputs = [inputs]
        if not isinstance(outputs, list):
            outputs = [outputs]

        Context.root_block.fns.append(fn)
        Context.root_block.dependencies.append(
            {
                "targets": [self._id],
                "trigger": event_name,
                "inputs": [block._id for block in inputs],
                "outputs": [block._id for block in outputs],
            }
        )


class BlockContext(Block):
    def __init__(self, css: Optional[Dict[str, str]] = None):
        """
        css: Css rules to apply to block.
        """
        self.children = []
        self.css = css if css is not None else {}
        super().__init__()

    def __enter__(self):
        self.parent = Context.block
        Context.block = self

    def __exit__(self, *args):
        Context.block = self.parent

    def get_template_context(self):
        return {"css": self.css}


class Row(BlockContext):
    def __init__(self, css: Optional[str] = None):
        """
        css: Css rules to apply to block.
        """
        super().__init__(css)

    def get_template_context(self):
        return {"type": "row", **super().get_template_context()}


class Column(BlockContext):
    def __init__(self, css: Optional[str] = None):
        """
        css: Css rules to apply to block.
        """
        super().__init__(css)

    def get_template_context(self):
        return {
            "type": "column",
            **super().get_template_context(),
        }


class Tabs(BlockContext):
    def __init__(self, css: Optional[dict] = None):
        """
        css: css rules to apply to block.
        """
        super().__init__(css)

    def change(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("change", fn, inputs, outputs)


class TabItem(BlockContext):
    def __init__(self, label, css: Optional[str] = None):
        """
        css: Css rules to apply to block.
        """
        super().__init__(css)
        self.label = label
        super(TabItem, self).__init__()

    def get_template_context(self):
        return {"label": self.label, **super().get_template_context()}

    def change(self, fn: Callable, inputs: List[Component], outputs: List[Component]):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
        Returns: None
        """
        self.set_event_trigger("change", fn, inputs, outputs)


class Blocks(Launchable, BlockContext):
    def __init__(self, theme="default"):
        # Cleanup shared parameters with Interface
        self.save_to = None
        self.ip_address = utils.get_local_ip_address()
        self.api_mode = False
        self.analytics_enabled = True
        self.theme = theme
        self.requires_permissions = False  # TODO: needs to be implemented
        self.enable_queue = False
        self.is_space = True if os.getenv("SYSTEM") == "spaces" else False

        super().__init__()
        Context.root_block = self
        self.blocks = {}
        self.fns = []
        self.dependencies = []

    def process_api(self, data: Dict[str, Any], username: str = None) -> Dict[str, Any]:
        raw_input = data["data"]
        fn_index = data["fn_index"]
        fn = self.fns[fn_index]
        dependency = self.dependencies[fn_index]

        processed_input = [
            self.blocks[input_id].preprocess(raw_input[i])
            for i, input_id in enumerate(dependency["inputs"])
        ]
        predictions = fn(*processed_input)
        if len(dependency["outputs"]) == 1:
            predictions = (predictions,)
        processed_output = [
            self.blocks[output_id].postprocess(predictions[i])
            if predictions[i] is not None
            else None
            for i, output_id in enumerate(dependency["outputs"])
        ]
        return {"data": processed_output}

    def get_template_context(self):
        return {"type": "column"}

    def get_config_file(self):
        from gradio.components import Component

        config = {"mode": "blocks", "components": [], "theme": self.theme}
        for _id, block in self.blocks.items():
            config["components"].append(
                {
                    "id": _id,
                    "type": block.__class__.__name__.lower(),
                    "props": block.get_template_context()
                    if hasattr(block, "get_template_context")
                    else None,
                }
            )

        def getLayout(block):
            if not isinstance(block, BlockContext):
                return {"id": block._id}
            children = []
            for child in block.children:
                children.append(getLayout(child))
            return {"id": block._id, "children": children}

        config["layout"] = getLayout(self)
        config["dependencies"] = self.dependencies
        return config

    def __enter__(self):
        BlockContext.__enter__(self)
        Context.root_block = self

    def __exit__(self, *args):
        BlockContext.__exit__(self, *args)
        Context.root_block = self.parent
