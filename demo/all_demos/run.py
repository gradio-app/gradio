import importlib
import gradio as gr
import os
import sys
import copy
import pathlib

os.environ["SYSTEM"] = "pretend-not-spaces"

demo_dir = pathlib.Path(__file__).parent / "demos"


all_demos = []
for p in os.listdir("./demos"):
    all_demos.append(p)

demo_module = None
with gr.Blocks() as mega_demo:
    with gr.Tabs():
        for demo_name in all_demos:
            with gr.TabItem(demo_name):
                old_path = copy.deepcopy(sys.path)
                sys.path = [os.path.join(demo_dir, demo_name)] + sys.path
                if demo_module is None:
                    demo_module = importlib.import_module(f"run")
                else:
                    demo_module = importlib.reload(demo_module)
                demo_module.demo
                sys.path = old_path

mega_demo.launch()
