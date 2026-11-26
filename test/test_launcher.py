from gradio.launcher import (
    inject_launcher,
    launcher_links,
    launcher_script,
)

SRC = "/gradio_api/launcher.js"
TAG = f'<script src="{SRC}"></script>'


def test_inject_launcher_at_end_of_head():
    html = b"<html><head><title>x</title></HEAD><body>hi</body></html>"
    assert inject_launcher(html, SRC) == (
        b"<html><head><title>x</title>"
        + TAG.encode()
        + b"</HEAD><body>hi</body></html>"
    )


def test_inject_launcher_without_head():
    assert inject_launcher(b"<body>hi</body>", SRC) == TAG.encode() + b"<body>hi</body>"
    assert inject_launcher(b"<h1>hi</h1>", SRC) == TAG.encode() + b"<h1>hi</h1>"


def test_inject_launcher_skips_pages_that_load_it():
    html = f"<head>{TAG}</head>".encode()
    assert inject_launcher(html, SRC) == html


def test_launcher_links_by_mode():
    links = ["api", "gradio", "settings", "runs", {"label": "x"}]
    assert launcher_links(links, mode="blocks", run_history=True) == [
        "api",
        "gradio",
        "settings",
        "runs",
    ]
    assert launcher_links(links, mode="server", run_history=True) == [
        "api",
        "gradio",
        "runs",
    ]
    assert launcher_links(links, mode="server", run_history=False) == ["api", "gradio"]
    assert launcher_links(None, mode="blocks", run_history=True) == []


def test_launcher_script_options():
    script = launcher_script(["gradio"], "https://example.com/app", "server")
    assert script.startswith(
        'window.__GRADIO_LAUNCHER__ = {"links": ["gradio"], '
        '"root": "https://example.com/app", "mode": "server"};\n'
    )
    assert "gradio-launcher" in script
