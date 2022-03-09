from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

from gradio import utils
from gradio.context import Context
from gradio.launchable import Launchable
from gradio.routes import PredictBody


class Block:
    def __init__(self):
        self._id = Context.id
        Context.id += 1
        if Context.block is not None:
            Context.block.children.append(self)
        if Context.root_block is not None:
            Context.root_block.blocks[self._id] = self
        self.events = []

    def click(self, fn, inputs, outputs):
        if not isinstance(inputs, list):
            inputs = [inputs]
        if not isinstance(outputs, list):
            outputs = [outputs]
        Context.root_block.fns.append(fn)
        Context.root_block.dependencies.append(
            {
                "targets": [self._id],
                "trigger": "click",
                "inputs": [block._id for block in inputs],
                "outputs": [block._id for block in outputs],
            }
        )


class BlockContext(Block):
    def __init__(self):
        self.children = []
        super().__init__()

    def __enter__(self):
        self.parent = Context.block
        Context.block = self

    def __exit__(self, *args):
        Context.block = self.parent


class Row(BlockContext):
    def get_template_context(self):
        return {"type": "row"}


class Column(BlockContext):
    def get_template_context(self):
        return {"type": "column"}


class Tab(BlockContext):
    def __init__(self, name):
        self.name = name
        super(Tab, self).__init__()

    def get_template_context(self):
        return {"type": "tab", "name": self.name}


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
        self.stateful = False  # TODO: implement state

        super().__init__()
        Context.root_block = self
        self.blocks = {}
        self.fns = []
        self.dependencies = []

    def process_api(self, data: PredictBody, username: str = None) -> Dict[str, Any]:
        raw_input = data.data
        fn_index = data.fn_index
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
        from gradio.component import Component

        config = {"mode": "blocks", "components": [], "theme": self.theme}
        for _id, block in self.blocks.items():
            if isinstance(block, Component):
                config["components"].append(
                    {
                        "id": _id,
                        "type": block.component_type,
                        "props": block.get_template_context(),
                    }
                )

        def getLayout(block_context):
            if not isinstance(block_context, BlockContext):
                return block_context._id
            children = []
            running_tabs = []
            for child in block_context.children:
                if isinstance(child, Tab):
                    running_tabs.append(getLayout(child))
                    continue
                if len(running_tabs):
                    children.append({"type": "tabset", "children": running_tabs})
                    running_tabs = []

                children.append(getLayout(child))
            if len(running_tabs):
                children.append({"type": "tabset", "children": running_tabs})
                running_tabs = []
            return {"children": children, **block_context.get_template_context()}

        config["layout"] = getLayout(self)
        config["dependencies"] = self.dependencies
        return config

    def __enter__(self):
        BlockContext.__enter__(self)
        Context.root_block = self

    def __exit__(self, *args):
        BlockContext.__exit__(self, *args)
        Context.root_block = self.parent
