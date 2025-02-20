from __future__ import annotations

import os

import gradio


def launch(
    app_file: str,
):
    if not app_file.endswith(".py"):
        app_file += ".py"
    app_file = os.path.join(os.getcwd(), app_file)
    config_file = os.path.join(os.getcwd(), app_file + ".json")
    # if not os.path.exists(config_file) and os.path.exists(app_file):
    #     print(
    #         "App file found without corresponding JSON config file. Use another app file name or type 'y' to overwrite."
    #     )
    #     overwrite = input("Overwrite? (y/n): ")
    #     if overwrite.lower() != "y":
    #         return
    gradio.gradio.sketch.launch(app_file, config_file)
