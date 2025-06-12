import lazy_loader as lazy
from typing import TYPE_CHECKING
from .utils import colors, fonts, sizes

__lazy_getattr__, __dir__, __all__ = lazy.attach(
    __name__,
    submodules=[],
    submod_attrs={
        "base": ["Base", "ThemeClass"],
        "citrus": ["Citrus"],
        "default": ["Default"],
        "glass": ["Glass"],
        "monochrome": ["Monochrome"],
        "ocean": ["Ocean"],
        "origin": ["Origin"],
        "soft": ["Soft"],
        "utils.colors": ["Color"],
        "utils.fonts": ["Font", "GoogleFont"],
        "utils.sizes": ["Size"],
    },
)


def __getattr__(name):
    if name == "Color":
        return colors.Color
    if name == "Font":
        return fonts.Font
    if name == "GoogleFont":
        return fonts.GoogleFont
    if name == "Size":
        return sizes.Size

    return __lazy_getattr__(name)


# Needed so static type inference doesn't break
# Make sure these imports stay synchronized with the lazy imports above
if TYPE_CHECKING:
    from gradio.themes.base import Base, ThemeClass
    from gradio.themes.citrus import Citrus
    from gradio.themes.default import Default
    from gradio.themes.glass import Glass
    from gradio.themes.monochrome import Monochrome
    from gradio.themes.ocean import Ocean
    from gradio.themes.origin import Origin
    from gradio.themes.soft import Soft
    from gradio.themes.utils.colors import Color
    from gradio.themes.utils.fonts import Font, GoogleFont
    from gradio.themes.utils.sizes import Size


def builder(*args, **kwargs):
    from gradio.themes.builder_app import demo

    return demo.launch(*args, **kwargs)
