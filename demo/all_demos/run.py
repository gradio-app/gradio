import importlib
import gradio as gr
import os
import sys
import copy
import pathlib

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

demo_dir = pathlib.Path(__file__).parent / "demos"

names = sorted(os.listdir("./demos"))

all_demos = []
demo_module = None
for p in sorted(os.listdir("./demos")):
    old_path = copy.deepcopy(sys.path)
    sys.path = [os.path.join(demo_dir, p)] + sys.path
    try:  # Some demos may not be runnable because of 429 timeouts, etc.
        if demo_module is None:
            demo_module = importlib.import_module("run")
        else:
            demo_module = importlib.reload(demo_module)
        all_demos.append((p, demo_module.demo, False))  # type: ignore
    except Exception as e:
        with gr.Blocks() as demo:
            gr.Markdown(f"Error loading demo: {e}")
        all_demos.append((p, demo, True))

app = gr.Blocks()

with app:
    gr.Markdown("""
# Deployed Demos
## Click through demos to test them out!
""")

for demo_name, demo, _ in all_demos:
    with app.route(demo_name):
        demo.render()

    # app = gr.mount_gradio_app(app, demo, f"/demo/{demo_name}")

if __name__ == "__main__":
    app.launch()
