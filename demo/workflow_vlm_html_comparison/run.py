import os
import re
import tempfile

import gradio as gr

# Side-by-side comparison of two recent vision-language models on the same
# screenshot-to-webpage task: one uploaded screenshot plus a shared instruction
# fan out to thinkingmachines/Inkling and moonshotai/Kimi-K2.7-Code as plain
# model nodes, each branch ending in the generated HTML *and* a screenshot of
# that HTML rendered in a real browser — so the two models can be compared
# visually against the original, not just by reading their code.
#
# The only bound function is the renderer: driving a browser isn't an inference
# task, so it has no model node equivalent.


def render_html(html: str) -> dict:
    """Screenshot generated HTML so the branches can be compared visually."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as e:
        raise gr.Error(
            "Rendering needs Playwright: pip install playwright "
            "&& playwright install chromium"
        ) from e

    # Models often return the file inside a fenced block despite being asked
    # for bare HTML; left in place, the fence renders as stray text.
    html = re.sub(r"^\s*```[a-zA-Z]*\n", "", html or "")
    html = re.sub(r"\n```\s*$", "", html)

    path = os.path.join(
        tempfile.gettempdir(), f"workflow_render_{os.urandom(8).hex()}.png"
    )
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.set_content(html or "<html></html>")
        page.wait_for_timeout(300)
        page.screenshot(path=path, full_page=True)
        browser.close()
    return {"path": path, "url": f"/gradio_api/file={path}", "is_file": True}


demo = gr.Workflow(graph="workflow.json", bind={"render_html": render_html})

if __name__ == "__main__":
    demo.launch()
