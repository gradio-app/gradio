import importlib
import gradio as gr
import os
import sys
import copy
import pathlib

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

demo_dir = pathlib.Path(__file__).parent / "demos"


all_demos = []
demo_module = None
with gr.Blocks() as mega_demo:
    gr.Markdown("Hey")

mega_demo.launch(auth=[("admin", "admin")])
