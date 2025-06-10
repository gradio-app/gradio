import lazy_loader as lazy

__getattr__, __dir__, __all__ = lazy.attach(
    __name__,
    submodules=[],
    submod_attrs={
        "client": ["Client"],
        "utils": ["file", "handle_file", "__version__"],
        "data_classes": ["FileData"],
    }
)
