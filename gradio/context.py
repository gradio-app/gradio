# Defines the Context class, which is used to store the state of all Blocks that are being rendered.

from __future__ import annotations

from contextvars import ContextVar
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.blocks import BlockContext, Blocks, BlocksConfig
    from gradio.helpers import Progress
    from gradio.renderable import Renderable
    from gradio.routes import Request


class _RequestContextVar:
    """ContextVar wrapper for the request that also provides a fallback for
    child threads.  ``threading.Thread`` does *not* inherit ``ContextVar``
    values, so ``@spaces.GPU`` decorated functions that run in a manually-
    spawned thread would read ``None`` and fall back to the Space's own
    ZeroGPU quota.  This wrapper keeps a module-level reference to the most
    recently set request so child threads can still find it."""

    def __init__(self) -> None:
        self._cv: ContextVar[Request | None] = ContextVar("request", default=None)
        self._latest: Request | None = None

    def set(self, value: Request | None):
        if value is not None:
            self._latest = value
        return self._cv.set(value)

    def get(self, default: Request | None = None) -> Request | None:
        result = self._cv.get(default)
        if result is not None:
            return result
        if self._latest is not None:
            return self._latest
        return default

    def reset(self, token) -> None:
        self._cv.reset(token)


class Context:
    root_block: Blocks | None = None  # The current root block that holds all blocks.
    block: BlockContext | None = None  # The current block that children are added to.
    id: int = 0  # Running id to uniquely refer to any block that gets defined
    token: str | None = None  # The token provided when loading private HF repos


class LocalContext:
    blocks: ContextVar[Blocks | None] = ContextVar("blocks")
    blocks_config: ContextVar[BlocksConfig | None] = ContextVar("blocks_config")
    renderable: ContextVar[Renderable | None] = ContextVar("renderable")
    render_block: ContextVar[BlockContext | None] = ContextVar("render_block")
    in_event_listener: ContextVar[bool] = ContextVar("in_event_listener")
    event_id: ContextVar[str | None] = ContextVar("event_id")
    request: _RequestContextVar = _RequestContextVar()
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
