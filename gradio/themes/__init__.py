import lazy_loader as lazy
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

def builder(*args, **kwargs):
    from gradio.themes.builder_app import demo

    return demo.launch(*args, **kwargs)
