import importlib
import sys
from typing import TYPE_CHECKING

import lazy_loader as lazy

from .utils import NO_RELOAD, FileSize, get_package_version, set_static_paths
from .wasm_utils import IS_WASM

__version__ = get_package_version()

_submod_attrs = {
    "blocks": ["Blocks"],
    "chat_interface": ["ChatInterface"],
    "components": [
        "HTML",
        "JSON",
        "Json",
        "AnnotatedImage",
        "Annotatedimage",
        "Audio",
        "BarPlot",
        "BrowserState",
        "Button",
        "Chatbot",
        "Checkbox",
        "CheckboxGroup",
        "Checkboxgroup",
        "ClearButton",
        "Code",
        "ColorPicker",
        "Component",
        "DataFrame",
        "Dataframe",
        "Dataset",
        "DateTime",
        "DeepLinkButton",
        "DownloadButton",
        "Dropdown",
        "DuplicateButton",
        "File",
        "FileExplorer",
        "Gallery",
        "Highlight",
        "HighlightedText",
        "Highlightedtext",
        "Image",
        "ImageEditor",
        "ImageSlider",
        "Label",
        "LinePlot",
        "LoginButton",
        "Markdown",
        "MessageDict",
        "Model3D",
        "MultimodalTextbox",
        "Number",
        "ParamViewer",
        "Plot",
        "Radio",
        "ScatterPlot",
        "Slider",
        "State",
        "Text",
        "Textbox",
        "Timer",
        "UploadButton",
        "Video",
        "component",
    ],
    "components.audio": ["WaveformOptions"],
    "components.image_editor": ["Brush", "Eraser", "LayerOptions", "WebcamOptions"],
    "data_classes": ["FileData"],
    "events": [
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
    ],
    "exceptions": ["Error"],
    "external": ["load", "load_chat"],
    "flagging": ["CSVLogger", "FlaggingCallback", "SimpleCSVLogger"],
    "helpers": [
        "Info",
        "Progress",
        "Success",
        "Warning",
        "skip",
        "update",
    ],
    "i18n": ["I18n"],
    "interface": ["Interface", "TabbedInterface", "close_all"],
    "layouts": [
        "Accordion",
        "Column",
        "Group",
        "Row",
        "Sidebar",
        "Tab",
        "TabItem",
        "Tabs",
    ],
    "oauth": ["OAuthProfile", "OAuthToken"],
    "renderable": ["render"],
    "routes": ["Request", "mount_gradio_app"],
}
# in templates.py not templates/
_templates_attrs = [
    "Files",
    "ImageMask",
    "List",
    "Matrix",
    "Mic",
    "Microphone",
    "Numpy",
    "Paint",
    "PlayableVideo",
    "Sketchpad",
    "TextArea",
]
if not IS_WASM:
    _submod_attrs["cli"] = ["deploy", "load_ipython_extension"]

__lazy_getattr__, _, __all__ = lazy.attach(
    __name__,
    submodules=["blocks", "components", "layouts", "themes"],
    submod_attrs=_submod_attrs,
)

# Need to be explicit to keep linter happy
__all__ = (
    list(__all__)
    + list(_templates_attrs)
    + [
        "Theme",
        "Examples",
    ]
)


def __getattr__(name):
    if name == "Theme":
        from .themes import Base as Theme
        return Theme
    if name == "Examples":
        from .helpers import create_examples as Examples
        return Examples
    if name in _templates_attrs:
        mod = sys.modules[__name__]
        original = getattr(importlib.import_module("gradio.templates"), name)
        setattr(mod, name, original)
        return original

    return __lazy_getattr__(name)


# Needed so static type inference doesn't break
# Make sure these imports stay synchronized with the lazy imports above
if TYPE_CHECKING:
    import json

    import gradio._simple_templates
    import gradio.image_utils
    import gradio.processing_utils
    import gradio.sketch
    import gradio.templates
    from gradio import components, layouts, themes
    from gradio.blocks import Blocks
    from gradio.chat_interface import ChatInterface
    from gradio.components import (
        HTML,
        JSON,
        AnnotatedImage,
        Annotatedimage,
        Audio,
        BarPlot,
        BrowserState,
        Button,
        Chatbot,
        ChatMessage,
        Checkbox,
        CheckboxGroup,
        Checkboxgroup,
        ClearButton,
        Code,
        ColorPicker,
        Component,
        DataFrame,
        Dataframe,
        Dataset,
        DateTime,
        DeepLinkButton,
        DownloadButton,
        Dropdown,
        DuplicateButton,
        File,
        FileExplorer,
        Gallery,
        Highlight,
        HighlightedText,
        Highlightedtext,
        Image,
        ImageEditor,
        ImageSlider,
        Json,
        Label,
        LinePlot,
        LoginButton,
        Markdown,
        MessageDict,
        Model3D,
        MultimodalTextbox,
        Number,
        ParamViewer,
        Plot,
        Radio,
        ScatterPlot,
        Slider,
        State,
        Text,
        Textbox,
        Timer,
        UploadButton,
        Video,
        component,
    )
    from gradio.components.audio import WaveformOptions
    from gradio.components.image_editor import (
        Brush,
        Eraser,
        LayerOptions,
        WebcamOptions,
    )
    from gradio.data_classes import FileData
    from gradio.events import (
        CopyData,
        DeletedFileData,
        DownloadData,
        EditData,
        EventData,
        KeyUpData,
        LikeData,
        RetryData,
        SelectData,
        UndoData,
        api,
        on,
    )
    from gradio.exceptions import Error
    from gradio.external import load, load_chat
    from gradio.flagging import (
        CSVLogger,
        FlaggingCallback,
        SimpleCSVLogger,
    )
    from gradio.helpers import Info, Progress, Success, Warning, skip, update
    from gradio.helpers import create_examples as Examples  # noqa: N812
    from gradio.i18n import I18n
    from gradio.interface import Interface, TabbedInterface, close_all
    from gradio.layouts import (
        Accordion,
        Column,
        Group,
        Row,
        Sidebar,
        Tab,
        TabItem,
        Tabs,
    )
    from gradio.oauth import OAuthProfile, OAuthToken
    from gradio.renderable import render
    from gradio.routes import Request, mount_gradio_app
    from gradio.templates import (
        Files,
        ImageMask,
        List,
        Matrix,
        Mic,
        Microphone,
        Numpy,
        Paint,
        PlayableVideo,
        Sketchpad,
        TextArea,
    )
    from gradio.themes import Base as Theme
    from gradio.utils import NO_RELOAD, FileSize, get_package_version, set_static_paths
    from gradio.wasm_utils import IS_WASM

    if not IS_WASM:
        from gradio.cli import deploy
        from gradio.ipython_ext import load_ipython_extension

    __all__ = [
        "Accordion",
        "AnnotatedImage",
        "Annotatedimage",
        "Audio",
        "BarPlot",
        "Blocks",
        "BrowserState",
        "Brush",
        "Button",
        "CSVLogger",
        "ChatInterface",
        "ChatMessage",
        "Chatbot",
        "Checkbox",
        "CheckboxGroup",
        "Checkboxgroup",
        "ClearButton",
        "Code",
        "ColorPicker",
        "Column",
        "CopyData",
        "DataFrame",
        "Dataframe",
        "Dataset",
        "DateTime",
        "DeletedFileData",
        "DownloadButton",
        "DownloadData",
        "Dropdown",
        "DuplicateButton",
        "EditData",
        "Eraser",
        "Error",
        "EventData",
        "Examples",
        "File",
        "FileData",
        "FileExplorer",
        "FileSize",
        "Files",
        "FlaggingCallback",
        "Gallery",
        "Group",
        "HTML",
        "Highlight",
        "HighlightedText",
        "Highlightedtext",
        "IS_WASM",
        "Image",
        "ImageEditor",
        "ImageSlider",
        "ImageMask",
        "Info",
        "Interface",
        "JSON",
        "Json",
        "KeyUpData",
        "Label",
        "LayerOptions",
        "LikeData",
        "LinePlot",
        "List",
        "LoginButton",
        "Markdown",
        "Matrix",
        "MessageDict",
        "Mic",
        "Microphone",
        "Model3D",
        "MultimodalTextbox",
        "NO_RELOAD",
        "Number",
        "Numpy",
        "OAuthProfile",
        "OAuthToken",
        "Paint",
        "ParamViewer",
        "PlayableVideo",
        "Plot",
        "Progress",
        "Radio",
        "Request",
        "RetryData",
        "Row",
        "ScatterPlot",
        "SelectData",
        "Sidebar",
        "SimpleCSVLogger",
        "Sketchpad",
        "Slider",
        "State",
        "Success",
        "Tab",
        "TabItem",
        "TabbedInterface",
        "Tabs",
        "Text",
        "TextArea",
        "Textbox",
        "Theme",
        "Timer",
        "UndoData",
        "UploadButton",
        "Video",
        "Warning",
        "WaveformOptions",
        "WebcamOptions",
        "__version__",
        "close_all",
        "deploy",
        "get_package_version",
        "I18n",
        "load",
        "load_chat",
        "load_ipython_extension",
        "mount_gradio_app",
        "on",
        "render",
        "set_static_paths",
        "skip",
        "update",
        "DeepLinkButton",
    ]
