import json

import importlib
from . import components, layouts, themes
from .utils import get_package_version
from .wasm_utils import IS_WASM

__version__ = get_package_version()

__all__ = [
    # Assumes we wish to export __all__ from these three
    *components.__all__,
    *layouts.__all__,
    *themes.__all__,
    # Other top-level exports
    "Blocks",
    "ChatInterface",
    "Interface",
    "TabbedInterface",
    "FileData",
    "CSVLogger",
    "FlaggingCallback",
    "SimpleCSVLogger",
    "Info",
    "Progress",
    "Success",
    "Warning",
    "skip",
    "update",
    "Examples",
    "I18n",
    "close_all",
    "OAuthProfile",
    "OAuthToken",
    "render",
    "Request",
    "mount_gradio_app",
    "Theme",
    "NO_RELOAD",
    "FileSize",
    "load",
    "load_chat",
    "IS_WASM",
    # Event data
    "CopyData",
    "DeletedFileData",
    "DownloadData",
    "EditData",
    "EventData",
    "KeyUpData",
    "LikeData",
    "RetryData",
    "SelectData",
    "UndoData",
    "api",
    "on",
    # Template constants
    "Files", "ImageMask", "List", "Matrix", "Mic", "Microphone", "Numpy",
    "Paint", "PlayableVideo", "Sketchpad", "TextArea",
    # Misc
    "__version__",
]
if not IS_WASM:
    __all__ += ["deploy", "load_ipython_extension"]

def __getattr__(name):
    # Assumes we wish to export __all__ from these three
    if hasattr(components, name):
        return getattr(components, name)
    if hasattr(layouts, name):
        return getattr(layouts, name)
    if hasattr(themes, name):
        return getattr(themes, name)

    match name:
        case "Blocks":
            return importlib.import_module("gradio.blocks").Blocks
        case "ChatInterface":
            return importlib.import_module("gradio.chat_interface").ChatInterface
        case "Interface":
            return importlib.import_module("gradio.interface").Interface
        case "TabbedInterface":
            return importlib.import_module("gradio.interface").TabbedInterface
        case "close_all":
            return importlib.import_module("gradio.interface").close_all
        case "FileData":
            return importlib.import_module("gradio.data_classes").FileData
        case "deploy":
            if not IS_WASM:
                return importlib.import_module("gradio.cli").deploy
        case "load_ipython_extension":
            if not IS_WASM:
                return importlib.import_module("gradio.ipython_ext").load_ipython_extension
        case "CSVLogger" | "FlaggingCallback" | "SimpleCSVLogger":
            return getattr(importlib.import_module("gradio.flagging"), name)
        case "Info" | "Progress" | "Success" | "Warning" | "skip" | "update":
            return getattr(importlib.import_module("gradio.helpers"), name)
        case "Examples":
            return importlib.import_module("gradio.helpers").create_examples
        case "I18n":
            return importlib.import_module("gradio.i18n").I18n
        case "OAuthProfile" | "OAuthToken":
            return getattr(importlib.import_module("gradio.oauth"), name)
        case "render":
            return importlib.import_module("gradio.renderable").render
        case "Request" | "mount_gradio_app":
            return getattr(importlib.import_module("gradio.routes"), name)
        case "Theme":
            return importlib.import_module("gradio.themes").Base
        case "NO_RELOAD" | "FileSize":
            return getattr(importlib.import_module("gradio.utils"), name)
        case "load" | "load_chat":
            return getattr(importlib.import_module("gradio.external"), name)
        case "CopyData" | "DeletedFileData" | "DownloadData" | "EditData" | "EventData" | "KeyUpData" | "LikeData" | "RetryData" | "SelectData" | "UndoData" | "api" | "on":
            return getattr(importlib.import_module("gradio.events"), name)
        case "Files" | "ImageMask" | "List" | "Matrix" | "Mic" | "Microphone" | "Numpy" | "Paint" | "PlayableVideo" | "Sketchpad" | "TextArea":
            return getattr(importlib.import_module("gradio.templates"), name)

    raise AttributeError(f"module 'gradio' has no attribute '{name}'")

def __dir__():
    return sorted(__all__)

