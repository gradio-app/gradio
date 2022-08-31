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
for p in sorted(os.listdir("./demos")):
    old_path = copy.deepcopy(sys.path)
    sys.path = [os.path.join(demo_dir, p)] + sys.path
    try:  # Some demos may not be runnable because of 429 timeouts, etc.
        if demo_module is None:
            demo_module = importlib.import_module(f"run")
        else:
            demo_module = importlib.reload(demo_module)
        all_demos.append((p, demo_module.demo))
    except Exception as e:
        p = p + " ❌"
        with gr.Blocks() as demo:
            gr.Markdown(f"Error loading demo: {e}")
        all_demos.append((p, demo))

with gr.Blocks() as mega_demo:
    for demo_name, demo in all_demos:
        with gr.Tab(demo_name):
            demo.render()

mega_demo.launch()
