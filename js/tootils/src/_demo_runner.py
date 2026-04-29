"""Test-only demo runner with parent-death detection.

Used by the Playwright e2e fixture instead of invoking demo run.py directly.
Reads the parent worker's PID from E2E_TEST_PARENT_PID and starts a daemon
thread that polls `os.kill(parent_pid, 0)`. If the parent is gone (test
worker SIGKILLed by playwright on timeout, etc.), the demo self-exits
within ~2s — preventing the "orphaned demo apps pile up across worker
restarts" pattern that produced 100+ leaked python procs / 7.5GB in the
SSR profile run.

Then runs the actual demo file as if it were `python <demo>`.
"""

import os
import runpy
import sys
import threading
import time


def _watch_parent(parent_pid: int) -> None:
    while True:
        try:
            os.kill(parent_pid, 0)
        except ProcessLookupError:
            os._exit(0)
        except PermissionError:
            # PID was reused for another user's process — treat as gone.
            os._exit(0)
        time.sleep(2)


def main() -> None:
    if len(sys.argv) < 2:
        sys.stderr.write("usage: _demo_runner.py <demo_path>\n")
        sys.exit(2)

    parent_pid_str = os.environ.get("E2E_TEST_PARENT_PID", "")
    if parent_pid_str:
        try:
            parent_pid = int(parent_pid_str)
            if parent_pid > 1:
                t = threading.Thread(
                    target=_watch_parent, args=(parent_pid,), daemon=True
                )
                t.start()
        except ValueError:
            pass

    demo_path = sys.argv[1]
    sys.argv = [demo_path] + sys.argv[2:]
    runpy.run_path(demo_path, run_name="__main__")


if __name__ == "__main__":
    main()
