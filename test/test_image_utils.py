from gradio.image_utils import extract_svg_content


def test_extract_svg_content_local_file():
    svg_path = "test/test_files/file_icon.svg"
    svg_content = extract_svg_content(svg_path)
    assert (
        svg_content
        == '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>'
    )


def test_extract_svg_content_from_url(monkeypatch):
    class MockResponse:
        def __init__(self):
            self.text = "<svg>mock svg content</svg>"

        def raise_for_status(self):
            pass

    async def mock_get(*args, **kwargs):
        return MockResponse()

    # extract_svg_content now routes through the SSRF-protected helper rather
    # than calling httpx.get directly, so patch that instead.
    monkeypatch.setattr(
        "gradio.processing_utils.async_ssrf_protected_get", mock_get
    )
    svg_content = extract_svg_content("https://example.com/test.svg")
    assert svg_content == "<svg>mock svg content</svg>"
