"""

Contains the functions that run when `gradio` is called from the command line. Specifically, allows

$ gradio app.py, to run app.py in reload mode where any changes in the app.py file or Gradio library reloads the demo.
$ gradio app.py my_demo, to use variable names other than "demo"
"""

from __future__ import annotations

import inspect
import os
import re
import site
import subprocess
import sys
import threading
from pathlib import Path
from typing import Optional

import typer
from rich import print

import gradio
from gradio import utils

reload_thread = threading.local()


def _setup_config(
    demo_path: Path,
    demo_name: str = "demo",
    additional_watch_dirs: list[str] | None = None,
    encoding: str = "utf-8",
):
    original_path = Path(demo_path)
    app_text = original_path.read_text(encoding=encoding)

    patterns = [
        f"with gr\\.Blocks\\(.*\\) as {demo_name}",
        f"{demo_name} = gr\\.Blocks",
        f"{demo_name} = gr\\.Interface",
        f"{demo_name} = gr\\.ChatInterface",
        f"{demo_name} = gr\\.TabbedInterface",
    ]

    if not any(re.search(p, app_text, flags=re.DOTALL) for p in patterns):
        print(
            f"\n[bold red]Warning[/]: Cannot statically find a gradio demo called {demo_name}. "
            "Reload work may fail."
        )

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
    if str(gradio_folder).strip():
        package_install = any(
            utils.is_in_or_equal(gradio_folder, d) for d in site.getsitepackages()
        )
        if not package_install:
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
    if str(abs_current).strip():
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
    return module_name, abs_original_path, [str(s) for s in watching_dirs], demo_name


def main(
    demo_path: Path,
    demo_name: str = "demo",
    watch_dirs: Optional[list[str]] = None,
    encoding: str = "utf-8",
):
    # default execution pattern to start the server and watch changes
    module_name, path, watch_sources, demo_name = _setup_config(
        demo_path, demo_name, watch_dirs, encoding
    )

    # Pass the following data as environment variables
    # so that we can set up reload mode correctly in the networking.py module
    popen = subprocess.Popen(
        [sys.executable, "-u", path],
        env=dict(
            os.environ,
            GRADIO_WATCH_DIRS=",".join(watch_sources),
            GRADIO_WATCH_MODULE_NAME=module_name,
            GRADIO_WATCH_DEMO_NAME=demo_name,
            GRADIO_WATCH_DEMO_PATH=str(path),
        ),
    )
    if popen.poll() is None:
        try:
            popen.wait()
        except (KeyboardInterrupt, OSError):
            pass


if __name__ == "__main__":
    typer.run(main)
