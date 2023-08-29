"""

Contains the functions that run when `gradio` is called from the command line. Specifically, allows

$ gradio app.py, to run app.py in reload mode where any changes in the app.py file or Gradio library reloads the demo.
$ gradio app.py my_demo, to use variable names other than "demo"
"""
import inspect
import os
import re
import subprocess
import sys
import threading
from pathlib import Path

import gradio
from gradio import utils

reload_thread = threading.local()


def _setup_config():
    args = sys.argv[1:]
    if len(args) == 0:
        raise ValueError("No file specified.")
    if len(args) == 1 or args[1].startswith("--"):
        demo_name = "demo"
    else:
        demo_name = args[1]
        if "." in demo_name:
            demo_name = demo_name.split(".")[0]
            print(
                "\nWARNING: As of Gradio 3.41.0, the parameter after the file path must be the name of the Gradio demo, not the FastAPI app. In most cases, this just means you should remove '.app' after the name of your demo, e.g. 'demo.app' -> 'demo'."
            )

    original_path = args[0]
    app_text = Path(original_path).read_text()

    patterns = [
        f"with gr\\.Blocks\\(\\) as {demo_name}",
        f"{demo_name} = gr\\.Blocks",
        f"{demo_name} = gr\\.Interface",
        f"{demo_name} = gr\\.ChatInterface",
        f"{demo_name} = gr\\.Series",
        f"{demo_name} = gr\\.Paralles",
        f"{demo_name} = gr\\.TabbedInterface",
    ]

    if not any(re.search(p, app_text) for p in patterns):
        print(
            f"\nWarning: Cannot statically find a gradio demo called {demo_name}. "
            "Reload work may fail."
        )

    abs_original_path = utils.abspath(original_path)
    path = os.path.normpath(original_path)
    path = path.replace("/", ".")
    path = path.replace("\\", ".")
    filename = os.path.splitext(path)[0]

    gradio_folder = Path(inspect.getfile(gradio)).parent

    message = "Watching:"
    message_change_count = 0

    watching_dirs = []
    if str(gradio_folder).strip():
        watching_dirs.append(gradio_folder)
        message += f" '{gradio_folder}'"
        message_change_count += 1

    abs_parent = abs_original_path.parent
    if str(abs_parent).strip():
        watching_dirs.append(abs_parent)
        if message_change_count == 1:
            message += ","
        message += f" '{abs_parent}'"

    print(message + "\n")

    # guaranty access to the module of an app
    sys.path.insert(0, os.getcwd())
    return filename, abs_original_path, [str(s) for s in watching_dirs], demo_name


def main():
    # default execution pattern to start the server and watch changes
    filename, path, watch_dirs, demo_name = _setup_config()
    args = sys.argv[1:]
    extra_args = args[1:] if len(args) == 1 or args[1].startswith("--") else args[2:]
    popen = subprocess.Popen(
        ["python", path] + extra_args,
        env=dict(
            os.environ,
            GRADIO_WATCH_DIRS=",".join(watch_dirs),
            GRADIO_WATCH_FILE=filename,
            GRADIO_WATCH_DEMO_NAME=demo_name,
        ),
    )
    popen.wait()


if __name__ == "__main__":
    main()
