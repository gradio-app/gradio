from __future__ import annotations

import threading
from collections import OrderedDict
from copy import deepcopy
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from gradio.blocks import Blocks


class StateHolder:
    def __init__(self):
        self.capacity = 10000
        self.cache = OrderedDict()
        self.lock = threading.Lock()

    def set_blocks(self, blocks: Blocks):
        self.blocks = blocks
        self.capacity = blocks.state_session_capacity

    def __getitem__(self, key: int) -> SessionState:
        if key not in self.cache:
            self.cache[key] = SessionState(self.blocks)
        self.update(key)
        return self.cache[key]

    def __contains__(self, key: int):
        return key in self.cache

    def update(self, key: int):
        with self.lock:
            if key in self.cache:
                self.cache.move_to_end(key)
            if len(self.cache) >= self.capacity:
                self.cache.popitem(last=False)


class SessionState:
    def __init__(self, blocks: Blocks | None = None):
        self.blocks = blocks
        self._data = {}

    def __getitem__(self, key: int) -> Any:
        if key not in self._data:
            if self.blocks is None:
                return None
            block = self.blocks.blocks[key]
            if getattr(block, "stateful", False):
                self._data[key] = deepcopy(getattr(block, "value", None))
            else:
                self._data[key] = None
        return self._data[key]

    def __setitem__(self, key: int, value: Any):
        self._data[key] = value

    def __contains__(self, key: int):
        return key in self._data
