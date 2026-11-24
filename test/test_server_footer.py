from gradio.server_footer import (
    footer_links_for_server,
    footer_script,
    inject_footer,
)

SRC = "/gradio_api/footer.js"
TAG = f'<script type="module" src="{SRC}"></script>'


def test_inject_footer_before_last_body_close():
    html = b"<html><body><p>&lt;/body&gt;</p></BODY></html>"
    assert inject_footer(html, SRC) == (
        b"<html><body><p>&lt;/body&gt;</p>" + TAG.encode() + b"</BODY></html>"
    )


def test_inject_footer_without_body_appends():
    assert inject_footer(b"<h1>hi</h1>", SRC) == b"<h1>hi</h1>" + TAG.encode()


def test_inject_footer_skips_pages_that_load_it():
    html = f"<body>{TAG}</body>".encode()
    assert inject_footer(html, SRC) == html


def test_footer_links_for_server_keeps_supported_links():
    links = ["api", "gradio", "settings", "runs", {"label": "x"}]
    assert footer_links_for_server(links, run_history=True) == ["gradio", "runs"]
    assert footer_links_for_server(links, run_history=False) == ["gradio"]


def test_footer_script_links():
    script = footer_script(["runs", "gradio"], "https://example.com/app", "/gradio_api")
    assert '"href": "https://example.com/app/gradio_api/runs"' in script
    assert '"href": "https://gradio.app"' in script
    assert '"links": []' in footer_script([], "", "/gradio_api")
