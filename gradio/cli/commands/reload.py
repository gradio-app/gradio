"""

Contains the functions that run when `gradio` is called from the command line. Specifically, allows

$ gradio app.py, to run app.py in reload mode where any changes in the app.py file or Gradio library reloads the demo.
$ gradio app.py my_demo, to use variable names other than "demo"
"""

from __future__ import annotations

import inspect
import os
import signal
import subprocess
import sys
import threading
from pathlib import Path

import typer
from rich import print

import gradio
from gradio import utils

reload_thread = threading.local()


def _handle_interrupt():
    """Handle interrupt signals and logout based on user preference"""

    if os.getenv("GRADIO_VIBE_MODE") and os.getenv("GRADIO_AUTO_LOGOUT") == "true":
        try:
            from huggingface_hub import logout

            logout()
            print("\n\nLogged out of Hugging Face")
        except Exception as e:
            print(f"\n\nError logging out of Hugging Face: {e}")

    sys.exit(0)


def _setup_config(
    demo_path: Path,
    additional_watch_dirs: list[str] | None = None,
    watch_library: bool = False,
):
    original_path = Path(demo_path)
    abs_original_path = utils.abspath(original_path)

    if original_path.is_absolute():
        relpath = original_path.relative_to(Path.cwd())
    else:
        relpath = original_path
    module_name = str(relpath.parent / relpath.stem).replace(os.path.sep, ".")

    gradio_folder = Path(inspect.getfile(gradio)).parent

    message = "Watching:"
    message_change_count = 0

    watching_dirs = []
    if str(gradio_folder).strip() and watch_library:
        # This is a source install
        watching_dirs.append(gradio_folder)
        message += f" '{gradio_folder}'"
        message_change_count += 1

    abs_parent = abs_original_path.parent
    if str(abs_parent).strip():
        watching_dirs.append(abs_parent)
        if message_change_count == 1:
            message += ","
        message += f" '{abs_parent}'"

    abs_current = Path.cwd().absolute()
    if str(abs_current).strip() and abs_current not in watching_dirs:
        try:
            gradio_folder.relative_to(abs_current)
            is_subdir = True
        except ValueError:
            is_subdir = False
        if is_subdir and not watch_library:
            pass
        else:
            watching_dirs.append(abs_current)
            if message_change_count == 1:
                message += ","
            message += f" '{abs_current}'"

    for wd in additional_watch_dirs or []:
        if Path(wd) not in watching_dirs:
            watching_dirs.append(wd)

            if message_change_count == 1:
                message += ","
            message += f" '{wd}'"

    print(message + "\n")

    # guarantee access to the module of an app
    sys.path.insert(0, os.getcwd())
    return module_name, abs_original_path, [str(s) for s in watching_dirs]


def main(
    demo_path: Path,
    demo_name: str = "",
    watch_dirs: list[str] | None = None,
    encoding: str = "utf-8",
    watch_library: bool = False,
):
    signal.signal(signal.SIGINT, lambda _signum, _frame: _handle_interrupt())
    signal.signal(signal.SIGTERM, lambda _signum, _frame: _handle_interrupt())

    # default execution pattern to start the server and watch changes
    module_name, path, watch_sources = _setup_config(
        demo_path, watch_dirs, watch_library
    )

    # Pass the following data as environment variables
    # so that we can set up reload mode correctly in the networking.py module
    env_vars = dict(
        os.environ,
        GRADIO_WATCH_DIRS=",".join(watch_sources),
        GRADIO_WATCH_MODULE_NAME=module_name,
        GRADIO_WATCH_DEMO_NAME=demo_name,
        GRADIO_WATCH_DEMO_PATH=str(path),
        GRADIO_WATCH_ENCODING=encoding,
    )

    if "GRADIO_VIBE_MODE" in os.environ:
        env_vars["GRADIO_VIBE_MODE"] = os.environ["GRADIO_VIBE_MODE"]

    popen = subprocess.Popen(
        [sys.executable, "-u", path],
        env=env_vars,
    )
    if popen.poll() is None:
        try:
            popen.wait()
        except (KeyboardInterrupt, OSError):
            pass


if __name__ == "__main__":
    typer.run(main)
