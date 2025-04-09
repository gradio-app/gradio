from typing import TYPE_CHECKING

from mcp.server.fastmcp import FastMCP

if TYPE_CHECKING:
    from gradio.blocks import Blocks

mcp = FastMCP("gradio")

def add_tools(block: "Blocks") -> FastMCP:
    for fn in block.fns.values():
        if fn.fn is not None and fn.show_api and isinstance(fn.api_name, str):
            mcp.add_tool(fn.fn, fn.api_name)

    return mcp