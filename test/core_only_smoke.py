"""Run by CI in an environment that has only the `gradio` and `gradio_client` wheels,
as `pip install gradio` gives: no `gradio_components`, so no components, no built
frontend, and no numpy, pandas or Pillow.

    python test/core_only_smoke.py
"""

import importlib.util
import inspect
import os
import sys

import httpx2 as httpx
from gradio_client import Client

import gradio as gr

HEAVY = ("gradio_components", "numpy", "pandas", "PIL")

app = gr.Server()


@app.api(name="add")
def add(a: int, b: int) -> int:
    return a + b


@app.get("/hello")
def hello():
    return {"hello": "world"}


if __name__ == "__main__":
    for name in HEAVY:
        assert importlib.util.find_spec(name) is None, f"{name} is installed"
    package = os.path.dirname(inspect.getfile(gr))
    assert not os.path.exists(os.path.join(package, "templates")), "frontend shipped"
    assert not os.path.exists(os.path.join(package, "media_assets")), "media shipped"

    # the default executor: a gateway process and worker processes
    _, url, _ = app.launch(prevent_thread_lock=True)
    assert Client(url, verbose=False).predict(2, 3, api_name="/add") == 5
    assert httpx.get(url + "hello").json() == {"hello": "world"}
    page = httpx.get(url)
    assert page.status_code == 200 and "gradio[components]" in page.text, page.text
    assert httpx.get(url + "gradio_api/info").status_code == 200

    for use in (lambda: gr.Blocks(), lambda: gr.Textbox, lambda: gr.Interface):
        try:
            use()
        except ImportError as error:
            assert 'pip install "gradio[components]"' in str(error)
        else:
            raise AssertionError("expected the install message")
    try:
        gr.get_image("bus.png")
    except ImportError as error:
        assert "gradio_components" in str(error)

    loaded = [name for name in HEAVY if name in sys.modules]
    assert not loaded, loaded
    print("core-only install: ok")
    sys.stdout.flush()
    os._exit(0)
