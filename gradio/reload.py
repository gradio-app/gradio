"""

Contains the functions that run when `gradio` is called from the command line. Specifically, allows

$ gradio app.py, to run app.py in reload mode where any changes in the app.py file or Gradio library reloads the demo.
$ gradio app.py my_demo.app, to use variable names other than "demo"
"""
import inspect
import os
import subprocess
import sys
from pathlib import Path

import gradio
from gradio import utils


def _setup_config():
    args = sys.argv[1:]
    if len(args) == 0:
        raise ValueError("No file specified.")

    original_path = args[0]
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
    return filename, abs_original_path, [str(s) for s in watching_dirs]


def main():
    # default execution pattern to start the server and watch changes
    filename, path, watch_dirs = _setup_config()
    popen = subprocess.Popen(
        ["python", path],
        env=dict(
            os.environ,
            GRADIO_WATCH_DIRS=",".join(watch_dirs),
            GRADIO_WATCH_FILE=filename,
        ),
    )
    popen.wait()


if __name__ == "__main__":
    main()
