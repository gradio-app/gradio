"""Test-only demo runner with parent-death detection.

Used by the Playwright e2e fixture instead of invoking demo run.py directly.
Watches stdin: Node spawns us with stdio="pipe", so when the playwright
worker dies (cleanly or via SIGKILL on timeout), the kernel closes our end
of the stdin pipe and the blocking read returns EOF — we self-exit
immediately, instead of becoming an orphan that survives the rest of the
suite. (Earlier this was a 2s polling loop on os.kill(parent_pid, 0); the
EOF approach is instant and doesn't need the parent PID plumbed in.)

Then runs the actual demo file as if it were `python <demo>`.
"""

import os
import runpy
import sys
import threading


def _watch_parent() -> None:
    # Blocks until the parent closes the stdin pipe (process death).
    sys.stdin.read()
    os._exit(0)


def main() -> None:
    if len(sys.argv) < 2:
        sys.stderr.write("usage: _demo_runner.py <demo_path>\n")
        sys.exit(2)

    threading.Thread(target=_watch_parent, daemon=True).start()

    demo_path = sys.argv[1]
    sys.argv = [demo_path] + sys.argv[2:]
    runpy.run_path(demo_path, run_name="__main__")


if __name__ == "__main__":
    main()
