from __future__ import annotations

from rich.live import Live
from rich.panel import Panel
import time
from typing import Optional, Type
from types import TracebackType

class LivePanelDisplay:

    def __init__(self, msg: str | None=None) -> None:
        self.lines = [msg] if msg else []
        self._panel = Live(Panel("\n".join(self.lines)), refresh_per_second=5)
    
    def update(self, msg: str, add_sleep: float | None=None):
        self.lines.append(msg)
        self._panel.update(Panel("\n".join(self.lines)))
        if add_sleep:
            time.sleep(add_sleep)

    def __enter__(self) -> "LivePanelDisplay":
        self._panel.__enter__()
        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType],
    ) -> None:
        self._panel.stop()
    