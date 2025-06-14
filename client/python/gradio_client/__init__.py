from typing import TYPE_CHECKING

import lazy_loader as lazy

__getattr__, __dir__, __all__ = lazy.attach(
    __name__,
    submodules=[],
    submod_attrs={
        "client": ["Client"],
        "utils": ["file", "handle_file", "__version__"],
        "data_classes": ["FileData"],
    },
)

# Needed so static type inference doesn't break
# Make sure these imports stay synchronized with the lazy imports above
if TYPE_CHECKING:
    from gradio_client.client import Client
    from gradio_client.data_classes import FileData
    from gradio_client.utils import __version__, file, handle_file

    __all__ = [
        "Client",
        "file",
        "handle_file",
        "FileData",
        "__version__",
    ]
