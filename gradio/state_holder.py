from __future__ import annotations

import datetime
import threading
from collections import OrderedDict
from copy import deepcopy
from typing import TYPE_CHECKING, Any, Callable

if TYPE_CHECKING:
    from gradio.blocks import Blocks


class StateHolder:
    def __init__(self):
        self.capacity = 10000
        self.session_data = OrderedDict()
        self.time_last_used: dict[str, datetime.datetime] = {}
        self.lock = threading.Lock()

    def set_blocks(self, blocks: Blocks):
        self.blocks = blocks
        self.capacity = blocks.state_session_capacity

    def reset(self, blocks: Blocks):
        """Reset the state holder with new blocks. Used during reload mode."""
        self.session_data = OrderedDict()
        # Call set blocks again to set new ids
        self.set_blocks(blocks)

    def __getitem__(self, session_id: str) -> SessionState:
        if session_id not in self.session_data:
            self.session_data[session_id] = SessionState(self.blocks)
        self.update(session_id)
        self.time_last_used[session_id] = datetime.datetime.now()
        return self.session_data[session_id]

    def __contains__(self, session_id: str):
        return session_id in self.session_data

    def update(self, session_id: str):
        with self.lock:
            if session_id in self.session_data:
                self.session_data.move_to_end(session_id)
            if len(self.session_data) > self.capacity:
                self.session_data.popitem(last=False)

    def delete_older_than_seconds(self, seconds: int):
        current_time = datetime.datetime.now()
        to_delete = []
        for session_id, time_last_used in self.time_last_used.items():
            print(session_id, time_last_used)
            if (current_time - time_last_used).seconds > seconds:
                with self.lock:
                    for component in self.session_data[session_id]:
                        if hasattr(component, "reset_callback") and isinstance(
                            component.reset_callback, Callable
                        ):
                            component.reset_callback()
                    print(
                        "Deleting session",
                        session_id,
                        "as it is older than",
                        seconds,
                        "seconds",
                    )
                    self.session_data.pop(session_id, None)
                    to_delete.append(session_id)
        for session_id in to_delete:
            self.time_last_used.pop(session_id, None)


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

    def __iter__(self):
        return iter(self._data.values())
