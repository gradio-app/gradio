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
        self.session_data = OrderedDict()
        self.lock = threading.Lock()

    def set_blocks(self, blocks: Blocks):
        self.blocks = blocks
        self.capacity = blocks.state_session_capacity

    def __getitem__(self, session_id: str) -> SessionState:
        if session_id not in self.session_data:
            self.session_data[session_id] = SessionState(self.blocks)
        self.update(session_id)
        return self.session_data[session_id]

    def __contains__(self, session_id: str):
        return session_id in self.session_data

    def update(self, session_id: str):
        with self.lock:
            if session_id in self.session_data:
                self.session_data.move_to_end(session_id)
            if len(self.session_data) > self.capacity:
                self.session_data.popitem(last=False)


class SessionState:
    def __init__(self, blocks: Blocks):
        self.blocks = blocks
        self._data = {}

    def __getitem__(self, key: int) -> Any:
        if key not in self._data:
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
