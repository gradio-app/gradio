from cProfile import run
from gradio.launchable import Launchable
from gradio import context, utils
from numpy import isin

class Block:
    def __init__(self):
        if context.block is not None:
            context.block.children.append(self)
        if context.root_block is not None:
            context.root_block.blocks.append(self)
        self._id = context.id
        self.events = []
        context.id += 1

    def click(self, fn, inputs, outputs):
        if not isinstance(inputs, list):
            inputs = [inputs]
        if not isinstance(outputs, list):
            outputs = [outputs]
        context.root_block.fns.append(fn)
        context.root_block.dependencies.append(
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
        self.parent = context.block
        context.block = self

    def __exit__(self, *args):
        context.block = self.parent


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

        super().__init__()
        context.root_block = self
        self.blocks = []
        self.fns = []
        self.dependencies = []

    def get_template_context(self):
        return {"type": "column"}

    def get_config_file(self):
        config = {"mode": "blocks", "components": [], "theme": self.theme}
        for block in self.blocks:
            if not isinstance(block, BlockContext):
                config["components"].append(
                    {
                        "id": block._id,
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
            return {
                "children": children,
                **block_context.get_template_context()
            }
        config["layout"] = getLayout(self)
        config["dependencies"] = self.dependencies
        return config

    def __enter__(self):
        BlockContext.__enter__(self)
        context.root_block = self

    def __exit__(self, *args):
        BlockContext.__exit__(self, *args)
        context.root_block = self.parent
