from gradio.themes.default import Default
from gradio.themes.utils.fonts import GoogleFont, LocalFont


def test_local_font_stylesheet_uses_bundled_static_path():
    stylesheet = LocalFont("Lexend", weights=(400, 600)).stylesheet()
    assert stylesheet["url"] is None
    assert "static/fonts/Lexend/Lexend-Regular.woff2" in stylesheet["css"]
    assert "static/fonts/Lexend/Lexend-SemiBold.woff2" in stylesheet["css"]


def test_google_font_falls_back_to_cdn_when_not_bundled():
    stylesheet = GoogleFont("Nonexistent Font XYZ", weights=(400,)).stylesheet()
    assert stylesheet["css"] is None
    assert stylesheet["url"] is not None
    assert "fonts.googleapis.com" in stylesheet["url"]


def test_default_theme_has_no_external_stylesheet_urls():
    theme = Default()
    assert theme._stylesheets == []
