import lazy_loader as lazy

__getattr__, __dir__, __all__ = lazy.attach(
    __name__,
    submodules=[],
    submod_attrs={
        "accordion": ["Accordion"],
        "column": ["Column"],
        "form": ["Form"],
        "group": ["Group"],
        "row": ["Row"],
        "sidebar": ["Sidebar"],
        "tabs": ["Tab", "TabItem", "Tabs"],
    },
)
