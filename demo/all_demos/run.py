import importlib
import gradio as gr
import os
import sys
import copy
import pathlib


demo_dir = pathlib.Path(__file__).parent / "demos"


all_demos = []
demo_module = None
for p in sorted(os.listdir("./demos")):
    old_path = copy.deepcopy(sys.path)
    sys.path = [os.path.join(demo_dir, p)] + sys.path
    if demo_module is None:
        demo_module = importlib.import_module(f"run")
    else:
        demo_module = importlib.reload(demo_module)
    all_demos.append((p, demo_module.demo))

with gr.Blocks() as mega_demo:
    with gr.Tabs():
        for demo_name, demo in all_demos:
            with gr.TabItem(demo_name):
                demo.render()

mega_demo.launch()
