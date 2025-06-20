from typing import TYPE_CHECKING

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

# Needed so static type inference doesn't break
# Make sure these imports stay synchronized with the lazy imports above
if TYPE_CHECKING:
    from .accordion import Accordion
    from .column import Column
    from .form import Form
    from .group import Group
    from .row import Row
    from .sidebar import Sidebar
    from .tabs import Tab, TabItem, Tabs

    __all__ = [
        "Accordion",
        "Column",
        "Form",
        "Row",
        "Group",
        "Tabs",
        "Tab",
        "TabItem",
        "Sidebar",
    ]
