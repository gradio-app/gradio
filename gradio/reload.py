"""

Contains the functions that run when `gradio` is called from the command line. Specifically, allows

$ gradio app.py, to run app.py in reload mode where any changes in the app.py file or Gradio library reloads the demo.
$ gradio app.py my_demo, to use variable names other than "demo"
"""
import inspect
import os
import sys

import gradio
from gradio import networking


def run_in_reload_mode():
    args = sys.argv[1:]
    if len(args) == 0:
        raise ValueError("No file specified.")
    if len(args) == 1:
        demo_name = "demo"
    else:
        demo_name = args[1]

    original_path = args[0]
    abs_original_path = os.path.abspath(original_path)
    path = os.path.normpath(original_path)
    path = path.replace("/", ".")
    path = path.replace("\\", ".")
    filename = os.path.splitext(path)[0]

    gradio_folder = os.path.dirname(inspect.getfile(gradio))

    port = networking.get_first_available_port(
        networking.INITIAL_PORT_VALUE,
        networking.INITIAL_PORT_VALUE + networking.TRY_NUM_PORTS,
        True,
    )
    print(
        f"\nLaunching in *reload mode* on: http://{networking.LOCALHOST_NAME}:{port} (Press CTRL+C to quit)\n"
    )
    command = f"uvicorn {filename}:{demo_name}.app --reload --port {port} --log-level warning "
    message = "Watching:"

    message_change_count = 0
    if gradio_folder.strip():
        command += f'--reload-dir "{gradio_folder}" '
        message += f" '{gradio_folder}'"
        message_change_count += 1

    if os.path.dirname(abs_original_path).strip():
        command += f'--reload-dir "{os.path.dirname(abs_original_path)}"'
        if message_change_count == 1:
            message += ","
        message += f" '{os.path.dirname(abs_original_path)}'"

    print(message + "\n")
    os.system(command)
