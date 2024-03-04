# Defines the Context class, which is used to store the state of all Blocks that are being rendered.

from __future__ import annotations

from contextvars import ContextVar
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.blocks import BlockContext, Blocks
    from gradio.helpers import Progress
    from gradio.routes import Request


class Context:
    root_block: Blocks | None = None  # The current root block that holds all blocks.
    block_context: BlockContext | None = (
        None  # The current block that children are added to.
    )
    id: int = 0  # Running id to uniquely refer to any block that gets defined
    ip_address: str | None = None  # The IP address of the user.
    hf_token: str | None = None  # The token provided when loading private HF repos


class LocalContext:
    blocks: ContextVar[Blocks | None] = ContextVar("blocks", default=None)
    in_event_listener: ContextVar[bool] = ContextVar("in_event_listener", default=False)
    in_render_block: ContextVar[bool] = ContextVar("in_render_block", default=False)
    render_root_block: ContextVar[Blocks | None] = ContextVar(
        "render_root_block", default=None
    )
    render_block_context: ContextVar[BlockContext | None] = ContextVar(
        "render_block_context", default=None
    )
    render_block_id: ContextVar[int] = ContextVar(
        "render_block_id", default=0
    )
    event_id: ContextVar[str | None] = ContextVar("event_id", default=None)
    request: ContextVar[Request | None] = ContextVar("request", default=None)
    progress: ContextVar[Progress | None] = ContextVar("progress", default=None)


def get_root_block() -> Blocks | None:
    if LocalContext.in_render_block.get():
        return LocalContext.render_root_block.get()
    else:
        return Context.root_block


def set_root_block(blocks: Blocks | None):
    if LocalContext.in_render_block.get():
        return LocalContext.render_root_block.set(blocks)
    else:
        Context.root_block = blocks


def get_block_context() -> BlockContext | None:
    if LocalContext.in_render_block.get():
        return LocalContext.render_block_context.get()
    else:
        return Context.block_context


def set_block_context(block_context: BlockContext | None):
    if LocalContext.in_render_block.get():
        LocalContext.render_block_context.set(block_context)
    else:
        Context.block_context = block_context


def get_next_block_id() -> int:
    if LocalContext.in_render_block.get():
        _id = LocalContext.render_block_id.get()
        LocalContext.render_block_id.set(_id + 1)
    else:
        _id = Context.id
        Context.id += 1
    return _id
