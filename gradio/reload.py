"""

Contains the functions that run when `gradio` is called from the command line. Specifically, allows

$ gradio app.py, to run app.py in user reload mode where any changes in the app.py reload the demo.
$ gradio-dev app.py, to run app.py in developer reload mode where any changes in the Gradio library reloads the demo.
$ gradio app.py my_demo, to use variable names other than "demo"
$ gradio-dev app.py my_demo, to use variable names other than "demo"
"""
import os
import sys

from gradio import networking


def run_in_reload_mode(mode: str):
    args = sys.argv[1:]
    if len(args) == 0:
        raise ValueError("No file specified.")
    if len(args) == 1:
        demo_name = "demo"
    else:
        demo_name = args[1]

    original_path = args[0]
    path = original_path.replace("/", ".")
    filename = os.path.splitext(path)[0]

    port = networking.get_first_available_port(
        networking.INITIAL_PORT_VALUE,
        networking.INITIAL_PORT_VALUE + networking.TRY_NUM_PORTS,
    )
    if mode == "user":
        print(
            f"\nLaunching in *reload mode* on: http://{networking.LOCALHOST_NAME}:{port} (Press CTRL+C to quit)\n"
        )
        os.system(
            f"uvicorn {filename}:{demo_name}.app --reload --port {port} --log-level warning"
        )
    elif mode == "dev":
        print(
            f"\nLaunching in *developer reload mode* on: http://{networking.LOCALHOST_NAME}:{port} (Press CTRL+C to quit)\n"
        )
        os.system(
            f"uvicorn {filename}:{demo_name}.app --reload --port {port} --log-level warning --reload-dir gradio --reload-dir {os.path.dirname(original_path)}"
        )


def user():
    run_in_reload_mode("user")


def dev():
    run_in_reload_mode("dev")
