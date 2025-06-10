import lazy_loader as lazy

__getattr__, __dir__, __all__ = lazy.attach(
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

def builder(*args, **kwargs):
    from gradio.themes.builder_app import demo

    return demo.launch(*args, **kwargs)
