from gradio.themes.base import Base, ThemeClass
from gradio.themes.citrus import Citrus
from gradio.themes.cyberpunk import Cyberpunk
from gradio.themes.default import Default
from gradio.themes.ember import Ember
from gradio.themes.glass import Glass
from gradio.themes.mario import Mario
from gradio.themes.monochrome import Monochrome
from gradio.themes.neon import Neon
from gradio.themes.ocean import Ocean
from gradio.themes.origin import Origin
from gradio.themes.soft import Soft
from gradio.themes.utils import colors, sizes
from gradio.themes.utils.colors import Color
from gradio.themes.utils.fonts import Font, GoogleFont
from gradio.themes.utils.sizes import Size

__all__ = [
    "Base",
    "Color",
    "Default",
    "Ember",
    "Font",
    "Glass",
    "GoogleFont",
    "Cyberpunk",
    "Monochrome",
    "Neon",
    "Size",
    "Soft",
    "ThemeClass",
    "colors",
    "sizes",
    "Origin",
    "Citrus",
    "Ocean",
    "Mario",
]


def builder(*args, **kwargs):
    from gradio.themes.builder_app import demo

    theme_css = """
.gradio-container {
    overflow: visible !important;
    max-width: none !important;
}
#controls {
    max-height: 100vh;
    flex-wrap: unset;
    overflow-y: scroll;
    position: sticky;
    top: 0;
}
#controls::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}

#controls::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, .5);
  box-shadow: 0 0 1px rgba(255, 255, 255, .5);
}
"""
    return demo.launch(
        *args,
        **kwargs,
        theme=Base(),
        css=theme_css,
        head="<style id='theme_css'></style>",
    )
