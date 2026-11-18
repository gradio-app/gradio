import os

import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio import page_template
from gradio.routes import toorjson


def write(tmp_path, content):
    path = tmp_path / "page.html"
    path.write_text(content, encoding="utf-8")
    return path


class TestRender:
    def test_escapes_text_values(self, tmp_path):
        path = write(tmp_path, '<meta content="{{ title }}" />')
        rendered = page_template.render(
            path, text={"title": "\"><script>alert('x')</script>&"}
        )
        assert rendered == (
            '<meta content="&quot;&gt;&lt;script&gt;alert(&#x27;x&#x27;)'
            '&lt;/script&gt;&amp;" />'
        )

    def test_raw_values_are_not_escaped(self, tmp_path):
        path = write(tmp_path, "<script>x = {{ data_json }};</script>")
        rendered = page_template.render(path, text={}, raw={"data_json": '{"a":1}'})
        assert rendered == '<script>x = {"a":1};</script>'

    def test_values_are_not_expanded_again(self, tmp_path):
        path = write(tmp_path, "{{ a }}|{{ b }}")
        rendered = page_template.render(
            path, text={"a": "{{ b }}"}, raw={"b": "{{ a }}"}
        )
        assert rendered == "{{ b }}|{{ a }}"

    def test_none_is_empty_and_spacing_is_optional(self, tmp_path):
        path = write(tmp_path, "[{{a}}][{{  b  }}]")
        assert page_template.render(path, text={"a": None, "b": 3}) == "[][3]"

    def test_unknown_placeholder_is_an_error(self, tmp_path):
        path = write(tmp_path, "{{ missing }}")
        with pytest.raises(KeyError, match="missing"):
            page_template.render(path, text={})

    def test_missing_page_is_an_error(self, tmp_path):
        with pytest.raises(FileNotFoundError):
            page_template.render(tmp_path / "nope.html", text={})

    def test_picks_up_a_rewritten_page(self, tmp_path):
        path = write(tmp_path, "one {{ a }}")
        assert page_template.render(path, text={"a": 1}) == "one 1"
        path.write_text("two {{ a }}", encoding="utf-8")
        stat = path.stat()
        os.utime(path, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1_000_000))
        assert page_template.render(path, text={"a": 1}) == "two 1"


def test_toorjson_cannot_close_a_script_tag():
    serialized = toorjson({"a": "</script><script>alert('x')</script>&"})
    assert not any(char in serialized for char in "<>&'")
    assert serialized.startswith('{"a":"')


def test_index_page_escapes_what_the_app_supplies():
    title = "T \"q\" </title><script>alert(1)</script> {{ config_json }}"
    with gr.Blocks(title=title) as demo:
        gr.Markdown("</script><script>alert(2)</script> {{ title }}")
    app, _, _ = demo.launch(prevent_thread_lock=True, ssr_mode=False)
    try:
        page = TestClient(app).get("/").text
    finally:
        demo.close()
    assert "<script>alert(" not in page
    assert (
        'content="T &quot;q&quot; &lt;/title&gt;&lt;script&gt;alert(1)'
        "&lt;/script&gt; {{ config_json }}\""
    ) in page
    assert "window.gradio_config = {" in page
    assert "\\u003c/script\\u003e\\u003cscript\\u003ealert(2)" in page
    # Nothing the app supplied was treated as a placeholder, and none are left
    assert page.count("window.gradio_config = {") == 1
    assert "{{ base_url }}" not in page and "{{ root_json }}" not in page
