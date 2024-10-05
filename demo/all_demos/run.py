import importlib
import gradio as gr
import os
import sys
import copy
import pathlib
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
import uvicorn
from gradio.utils import get_space

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

demo_dir = pathlib.Path(__file__).parent / "demos"

app = FastAPI()

templates = Jinja2Templates(directory="templates")

names = sorted(os.listdir("./demos"))


@app.get("/")
def index(request: Request):
    names = [[p[0], p[2]] for p in all_demos]
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "names": names,
            "initial_demo": names[0][0],
            "is_space": get_space(),
        },
    )


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
        all_demos.append((p, demo_module.demo, False))
    except Exception as e:
        with gr.Blocks() as demo:
            gr.Markdown(f"Error loading demo: {e}")
        all_demos.append((p, demo, True))

for demo_name, demo, _ in all_demos:
    app = gr.mount_gradio_app(app, demo, f"/demo/{demo_name}")

if __name__ == "__main__":
    uvicorn.run(app, port=7860, host="0.0.0.0")
