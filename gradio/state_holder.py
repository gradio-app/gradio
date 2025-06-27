from __future__ import annotations

import datetime
import os
import threading
from collections import OrderedDict
from collections.abc import Iterator
from copy import copy, deepcopy
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from gradio.blocks import Blocks
    from gradio.components import State


class StateHolder:
    def __init__(self):
        self.capacity = 10000
        self.session_data: OrderedDict[str, SessionState] = OrderedDict()
        self.time_last_used: dict[str, datetime.datetime] = {}
        self.lock = threading.Lock()

    def set_blocks(self, blocks: Blocks):
        self.blocks = blocks
        blocks.state_holder = self
        self.capacity = blocks.state_session_capacity

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

    def delete_all_expired_state(
        self,
    ):
        for session_id in self.session_data:
            self.delete_state(session_id, expired_only=True)

    def delete_state(self, session_id: str, expired_only: bool = False):
        if session_id not in self.session_data:
            return
        to_delete = []
        session_state = self.session_data[session_id]
        for component, value, expired in session_state.state_components:
            if not expired_only or expired:
                component.delete_callback(value)
                to_delete.append(component._id)
        for component in to_delete:
            del session_state.state_data[component]


class SessionState:
    def __init__(self, blocks: Blocks):
        self.blocks_config = copy(blocks.default_config)
        # Keep a separate deep copy of the config so we can recreate
        # the state for deep links
        self.config_values = {
            k: self.blocks_config.config_for_block(k, [], v)
            for k, v in self.blocks_config.blocks.items()
            if k in blocks.blocks
        }
        self.state_data: dict[int, Any] = {}
        self._state_ttl = {}
        self.is_closed = False
        # When a session is closed, the state is stored for an hour to give the user time to reopen the session.
        # During testing we set to a lower value to be able to test
        self.STATE_TTL_WHEN_CLOSED = (
            1 if os.getenv("GRADIO_IS_E2E_TEST", None) else 3600
        )

    def __getitem__(self, key: int) -> Any:
        block = self.blocks_config.blocks[key]
        if block.stateful:
            if key not in self.state_data:
                self.state_data[key] = deepcopy(getattr(block, "value", None))
            return self.state_data[key]
        else:
            return block

    def __setitem__(self, key: int, value: Any):
        from gradio.components import State

        block = self.blocks_config.blocks.get(key)
        if isinstance(block, State):
            self._state_ttl[key] = (
                block.time_to_live,
                datetime.datetime.now(),
            )
            self.state_data[key] = value
        else:
            self.blocks_config.blocks[key] = value
        if block:
            self.config_values[key] = self.blocks_config.config_for_block(
                key, [], block
            )

    def _update_config(self, key: int):
        if self[key] is not None:
            self.config_values[key] = self.blocks_config.config_for_block(
                key, [], self[key]
            )

    def _update_value_in_config(self, key: int, value: Any):
        if key not in self.config_values:
            self.config_values[key] = self.blocks_config.config_for_block(
                key, [], self.blocks_config.blocks[key]
            )
        if "props" in self.config_values[key]:
            self.config_values[key]["props"]["value"] = value

    def __contains__(self, key: int):
        block = self.blocks_config.blocks.get(key)
        if block is None:
            return False
        if block.stateful:
            return key in self.state_data
        else:
            return key in self.blocks_config.blocks

    @property
    def components(self) -> Iterator[dict]:
        for _, config in self.config_values.items():
            if config:
                yield config

    @property
    def state_components(self) -> Iterator[tuple[State, Any, bool]]:
        from gradio.components import State

        for id in self.state_data:
            block = self.blocks_config.blocks[id]
            if isinstance(block, State) and id in self._state_ttl:
                time_to_live, created_at = self._state_ttl[id]
                if self.is_closed:
                    time_to_live = self.STATE_TTL_WHEN_CLOSED
                value = self.state_data[id]
                yield (
                    block,
                    value,
                    (datetime.datetime.now() - created_at).seconds > time_to_live,
                )
