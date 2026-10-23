"""Starting gateway processes without paying for Gradio's import each time.

Most of a gateway's startup is importing Gradio in a new interpreter. With
GRADIO_GATEWAY_ZYGOTE=1, where `fork()` exists, the first launch starts a zygote, a process that imports
Gradio once and forks a gateway for this launch and each later one in
milliseconds (tests, notebooks and reloads launch many times). An idle
zygote exits after ZYGOTE_IDLE_SECONDS. Elsewhere each launch spawns a gateway.

Each gateway takes the app's environment and working directory when it
starts (see `gateway.adopt_environment`). The zygote is used only if the
variables Gradio reads at import time and does not refresh there are
unchanged since it started; otherwise the launch spawns a gateway as usual.
"""

from __future__ import annotations

import atexit
import os
import signal
import subprocess
import sys
import threading
import time


class _State:
    lock = threading.Lock()
    zygote: subprocess.Popen | None = None
    context: tuple | None = None
    # Where the zygote writes the pid of each gateway it forks
    replies: int | None = None


_state = _State()
ZYGOTE_IDLE_SECONDS = 120


# Read at import time by modules a gateway has imported, and not refreshed
IMPORT_TIME_VARIABLES = (
    "GRADIO_HOT_RELOAD",
    "GRADIO_WATCH_DIRS",
    "GRADIO_WATCH_MODULE_NAME",
    "GRADIO_WATCH_DEMO_NAME",
    "GRADIO_WATCH_DEMO_PATH",
    "GRADIO_LOCAL_DEV_MODE",
    "GRADIO_SHARE_SERVER_ADDRESS",
    "GRADIO_PROFILING",
    "OAUTH_CLIENT_ID",
    "OAUTH_CLIENT_SECRET",
    "OAUTH_SCOPES",
    "OPENID_PROVIDER_URL",
)


def _context() -> tuple:
    return (sys.executable, *(os.environ.get(k) for k in IMPORT_TIME_VARIABLES))


def _gateway_env() -> dict[str, str]:
    return {**os.environ, "GRADIO_PROCESS_GATEWAY": "1"}


def prewarm() -> None:
    """Starts the zygote, if opted into, unless it runs already or this process
    is a gateway."""
    if os.environ.get("GRADIO_GATEWAY_ZYGOTE", "").lower() not in ("1", "true"):
        return
    if not hasattr(os, "fork") or os.environ.get("GRADIO_PROCESS_GATEWAY"):
        return
    if os.environ.get("GRADIO_PROCESS_REPLICA"):
        return
    with _state.lock:
        if _state.zygote is not None and _state.zygote.poll() is None:
            return
        read, write = os.pipe()
        _state.zygote = subprocess.Popen(
            [sys.executable, "-m", "gradio.processing.gateway", "--zygote", str(write)],
            env=_gateway_env(),
            stdin=subprocess.PIPE,
            pass_fds=[write],
        )
        os.close(write)
        _state.replies, _state.context = read, _context()


def discard() -> None:
    with _state.lock:
        zygote, replies = _state.zygote, _state.replies
        _state.zygote = _state.replies = None
    if zygote is not None and zygote.poll() is None:
        zygote.kill()
        zygote.wait()
    if replies is not None:
        os.close(replies)


class ForkedGateway:
    """The parts of Popen the worker uses, for a gateway the zygote forked."""

    def __init__(self, pid: int):
        self.pid = pid

    def poll(self) -> int | None:
        try:
            os.kill(self.pid, 0)
        except ProcessLookupError:
            return 0
        return None

    def terminate(self) -> None:
        self._signal(signal.SIGTERM)

    def kill(self) -> None:
        self._signal(signal.SIGKILL)

    def _signal(self, signum: int) -> None:
        try:
            os.kill(self.pid, signum)
        except ProcessLookupError:
            pass

    def wait(self, timeout: float | None = None) -> int:
        deadline = None if timeout is None else time.monotonic() + timeout
        while self.poll() is None:
            if deadline is not None and time.monotonic() > deadline:
                raise subprocess.TimeoutExpired(str(self.pid), timeout or 0)
            time.sleep(0.02)
        return 0


def start_gateway(bootstrap_path: str):
    """A gateway process serving the app described in `bootstrap_path`."""
    if _state.zygote is None or _state.zygote.poll() is not None:
        prewarm()
    with _state.lock:
        zygote, replies, context = _state.zygote, _state.replies, _state.context
        usable = (
            zygote is not None
            and zygote.poll() is None
            and zygote.stdin is not None
            and replies is not None
            and context == _context()
        )
        if usable:
            try:
                zygote.stdin.write(bootstrap_path.encode() + b"\n")  # type: ignore[union-attr]
                zygote.stdin.flush()  # type: ignore[union-attr]
                pid = b""
                while not pid.endswith(b"\n"):
                    chunk = os.read(replies, 32)  # type: ignore[arg-type]
                    if not chunk:
                        raise OSError("the zygote exited")
                    pid += chunk
                return ForkedGateway(int(pid))
            except (OSError, ValueError):
                pass
    discard()
    return subprocess.Popen(
        [sys.executable, "-m", "gradio.processing.gateway", bootstrap_path],
        env=_gateway_env(),
    )


def run_zygote(reply_fd: int) -> None:
    """The zygote's loop: fork a gateway for each bootstrap path on stdin."""
    import urllib.request

    from gradio.processing import gateway

    # On macOS, urllib reads the system proxy settings through CoreFoundation,
    # which crashes a forked child, and HTTP clients read them at startup.
    # Read them once here; forked gateways get these answers instead.
    scproxy = {}
    if sys.platform == "darwin":
        proxies = urllib.request._get_proxies()  # type: ignore[attr-defined]
        settings = urllib.request._get_proxy_settings()  # type: ignore[attr-defined]
        scproxy = {
            "_get_proxies": lambda: dict(proxies),
            "_get_proxy_settings": lambda: dict(settings),
        }
    # Forked gateways are reaped automatically
    signal.signal(signal.SIGCHLD, signal.SIG_IGN)
    import select

    while True:
        ready, _, _ = select.select([sys.stdin], [], [], ZYGOTE_IDLE_SECONDS)
        if not ready:
            return
        line = sys.stdin.readline()
        if not line:
            return
        path = line.strip()
        if not path:
            continue
        pid = os.fork()
        if pid == 0:
            signal.signal(signal.SIGCHLD, signal.SIG_DFL)
            for name, replacement in scproxy.items():
                setattr(urllib.request, name, replacement)
            os.close(reply_fd)
            devnull = os.open(os.devnull, os.O_RDONLY)
            os.dup2(devnull, 0)
            code = 0
            try:
                gateway.main(path)
            except BaseException:
                import traceback

                traceback.print_exc()
                code = 1
            finally:
                sys.stdout.flush()
                sys.stderr.flush()
                os._exit(code)
        os.write(reply_fd, f"{pid}\n".encode())


atexit.register(discard)
