# Defines the Context class, which is used to store the state of all Blocks that are being rendered.

from __future__ import annotations

from contextvars import ContextVar
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.blocks import BlockContext, Blocks, BlocksConfig
    from gradio.helpers import Progress
    from gradio.renderable import Renderable
    from gradio.routes import Request


class Context:
    root_block: Blocks | None = None  # The current root block that holds all blocks.
    block: BlockContext | None = None  # The current block that children are added to.
    id: int = 0  # Running id to uniquely refer to any block that gets defined
    hf_token: str | None = None  # The token provided when loading private HF repos


class LocalContext:
    blocks: ContextVar[Blocks | None] = ContextVar("blocks")
    blocks_config: ContextVar[BlocksConfig | None] = ContextVar("blocks_config")
    renderable: ContextVar[Renderable | None] = ContextVar("renderable")
    render_block: ContextVar[BlockContext | None] = ContextVar("render_block")
    in_event_listener: ContextVar[bool] = ContextVar("in_event_listener")
    event_id: ContextVar[str | None] = ContextVar("event_id")
    request: ContextVar[Request | None] = ContextVar("request")
    progress: ContextVar[Progress | None] = ContextVar("progress")
    key_to_id_map: ContextVar[dict[int | str | tuple[str | int, ...], int] | None] = (
        ContextVar("key_to_id_map")
    )


def get_render_context() -> BlockContext | None:
    if LocalContext.renderable.get(None):
        return LocalContext.render_block.get(None)
    else:
        return Context.block


def set_render_context(block: BlockContext | None):
    if LocalContext.renderable.get(None):
        LocalContext.render_block.set(block)
    else:
        Context.block = block


def get_blocks_context() -> BlocksConfig | None:
    if LocalContext.renderable.get(None):
        return LocalContext.blocks_config.get(None)
    elif Context.root_block:
        return Context.root_block.default_config
