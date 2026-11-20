"""Gradio. `pip install gradio` installs the core: the server, the queue, the API
engine and `gr.Server`. The names that build a user interface (`gr.Blocks`,
`gr.Interface` and every component) need the `gradio_components` package, installed
with `pip install "gradio[components]"`; using one without it raises an error that
says so."""

import importlib.util
import json
from typing import TYPE_CHECKING

from gradio import _components_package, components, mcp, themes, validators
from gradio.blocks import close_all
from gradio.caching import Cache, cache
from gradio.cli import deploy
from gradio.components import Component, State, component
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
from gradio.helpers import Info, Progress, Success, Warning, skip, update, validate
from gradio.i18n import I18n
from gradio.ipython_ext import load_ipython_extension
from gradio.oauth import OAuthProfile, OAuthToken
from gradio.route_utils import Header
from gradio.routes import Request, mount_gradio_app
from gradio.server import Server
from gradio.themes import Base as Theme
from gradio.utils import NO_RELOAD, FileSize, get_package_version, set_static_paths

if TYPE_CHECKING:
    from gradio_components import (
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
        DataFrame,
        Dataframe,
        Dataset,
        DateTime,
        DeepLinkButton,
        Dialogue,
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
        InputHTMLAttributes,
        Json,
        Label,
        LinePlot,
        LoginButton,
        Markdown,
        MessageDict,
        Model3D,
        MultimodalTextbox,
        Navbar,
        Number,
        ParamViewer,
        Plot,
        Radio,
        ScatterPlot,
        Slider,
        Text,
        Textbox,
        Timer,
        UploadButton,
        Video,
        WorkflowCanvas,
    )
    from gradio_components.audio import MicrophoneOptions, WaveformOptions
    from gradio_components.chat_interface import ChatInterface
    from gradio_components.external import load, load_chat, load_openapi
    from gradio_components.flagging import CSVLogger, FlaggingCallback, SimpleCSVLogger
    from gradio_components.image_editor import (
        Brush,
        Eraser,
        LayerOptions,
        WatermarkOptions,
        WebcamOptions,
    )
    from gradio_components.interface import Interface, TabbedInterface
    from gradio_components.layouts import (
        Accordion,
        Column,
        Draggable,
        Group,
        Row,
        Sidebar,
        Step,
        Tab,
        TabItem,
        Tabs,
        Walkthrough,
    )
    from gradio_components.templates import (
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

    from gradio import streaming
    from gradio.blocks import Blocks
    from gradio.helpers import create_examples as Examples  # noqa: N812
    from gradio.media import (
        get_audio,
        get_file,
        get_image,
        get_model3d,
        get_video,
    )
    from gradio.renderable import render
    from gradio.webrtc.options import AudioChunk, VideoFrame, WebRTCOptions
    from gradio.workflow import Workflow

# Names that need `gradio_components`, and where each one is defined.
_NEEDS_COMPONENTS: dict[str, tuple[str, str]] = {
    "Blocks": ("gradio.blocks", "Blocks"),
    "ChatInterface": ("gradio_components.chat_interface", "ChatInterface"),
    "HTML": ("gradio_components", "HTML"),
    "JSON": ("gradio_components", "JSON"),
    "AnnotatedImage": ("gradio_components", "AnnotatedImage"),
    "Annotatedimage": ("gradio_components", "Annotatedimage"),
    "Audio": ("gradio_components", "Audio"),
    "BarPlot": ("gradio_components", "BarPlot"),
    "BrowserState": ("gradio_components", "BrowserState"),
    "Button": ("gradio_components", "Button"),
    "Chatbot": ("gradio_components", "Chatbot"),
    "ChatMessage": ("gradio_components", "ChatMessage"),
    "Checkbox": ("gradio_components", "Checkbox"),
    "CheckboxGroup": ("gradio_components", "CheckboxGroup"),
    "Checkboxgroup": ("gradio_components", "Checkboxgroup"),
    "ClearButton": ("gradio_components", "ClearButton"),
    "Code": ("gradio_components", "Code"),
    "ColorPicker": ("gradio_components", "ColorPicker"),
    "DataFrame": ("gradio_components", "DataFrame"),
    "Dataframe": ("gradio_components", "Dataframe"),
    "Dataset": ("gradio_components", "Dataset"),
    "DateTime": ("gradio_components", "DateTime"),
    "DeepLinkButton": ("gradio_components", "DeepLinkButton"),
    "Dialogue": ("gradio_components", "Dialogue"),
    "DownloadButton": ("gradio_components", "DownloadButton"),
    "Dropdown": ("gradio_components", "Dropdown"),
    "DuplicateButton": ("gradio_components", "DuplicateButton"),
    "File": ("gradio_components", "File"),
    "FileExplorer": ("gradio_components", "FileExplorer"),
    "Gallery": ("gradio_components", "Gallery"),
    "Highlight": ("gradio_components", "Highlight"),
    "HighlightedText": ("gradio_components", "HighlightedText"),
    "Highlightedtext": ("gradio_components", "Highlightedtext"),
    "Image": ("gradio_components", "Image"),
    "ImageEditor": ("gradio_components", "ImageEditor"),
    "ImageSlider": ("gradio_components", "ImageSlider"),
    "InputHTMLAttributes": ("gradio_components", "InputHTMLAttributes"),
    "Json": ("gradio_components", "Json"),
    "Label": ("gradio_components", "Label"),
    "LinePlot": ("gradio_components", "LinePlot"),
    "LoginButton": ("gradio_components", "LoginButton"),
    "Markdown": ("gradio_components", "Markdown"),
    "MessageDict": ("gradio_components", "MessageDict"),
    "Model3D": ("gradio_components", "Model3D"),
    "MultimodalTextbox": ("gradio_components", "MultimodalTextbox"),
    "Navbar": ("gradio_components", "Navbar"),
    "Number": ("gradio_components", "Number"),
    "ParamViewer": ("gradio_components", "ParamViewer"),
    "Plot": ("gradio_components", "Plot"),
    "Radio": ("gradio_components", "Radio"),
    "ScatterPlot": ("gradio_components", "ScatterPlot"),
    "Slider": ("gradio_components", "Slider"),
    "Text": ("gradio_components", "Text"),
    "Textbox": ("gradio_components", "Textbox"),
    "Timer": ("gradio_components", "Timer"),
    "UploadButton": ("gradio_components", "UploadButton"),
    "Video": ("gradio_components", "Video"),
    "WorkflowCanvas": ("gradio_components", "WorkflowCanvas"),
    "MicrophoneOptions": ("gradio_components.audio", "MicrophoneOptions"),
    "WaveformOptions": ("gradio_components.audio", "WaveformOptions"),
    "Brush": ("gradio_components.image_editor", "Brush"),
    "Eraser": ("gradio_components.image_editor", "Eraser"),
    "LayerOptions": ("gradio_components.image_editor", "LayerOptions"),
    "WatermarkOptions": ("gradio_components.image_editor", "WatermarkOptions"),
    "WebcamOptions": ("gradio_components.image_editor", "WebcamOptions"),
    "load": ("gradio_components.external", "load"),
    "load_chat": ("gradio_components.external", "load_chat"),
    "load_openapi": ("gradio_components.external", "load_openapi"),
    "CSVLogger": ("gradio_components.flagging", "CSVLogger"),
    "FlaggingCallback": ("gradio_components.flagging", "FlaggingCallback"),
    "SimpleCSVLogger": ("gradio_components.flagging", "SimpleCSVLogger"),
    "Examples": ("gradio.helpers", "create_examples"),
    "Interface": ("gradio_components.interface", "Interface"),
    "TabbedInterface": ("gradio_components.interface", "TabbedInterface"),
    "Accordion": ("gradio_components.layouts", "Accordion"),
    "Column": ("gradio_components.layouts", "Column"),
    "Draggable": ("gradio_components.layouts", "Draggable"),
    "Group": ("gradio_components.layouts", "Group"),
    "Row": ("gradio_components.layouts", "Row"),
    "Sidebar": ("gradio_components.layouts", "Sidebar"),
    "Step": ("gradio_components.layouts", "Step"),
    "Tab": ("gradio_components.layouts", "Tab"),
    "TabItem": ("gradio_components.layouts", "TabItem"),
    "Tabs": ("gradio_components.layouts", "Tabs"),
    "Walkthrough": ("gradio_components.layouts", "Walkthrough"),
    "get_audio": ("gradio.media", "get_audio"),
    "get_file": ("gradio.media", "get_file"),
    "get_image": ("gradio.media", "get_image"),
    "get_model3d": ("gradio.media", "get_model3d"),
    "get_video": ("gradio.media", "get_video"),
    "render": ("gradio.renderable", "render"),
    "Files": ("gradio_components.templates", "Files"),
    "ImageMask": ("gradio_components.templates", "ImageMask"),
    "List": ("gradio_components.templates", "List"),
    "Matrix": ("gradio_components.templates", "Matrix"),
    "Mic": ("gradio_components.templates", "Mic"),
    "Microphone": ("gradio_components.templates", "Microphone"),
    "Numpy": ("gradio_components.templates", "Numpy"),
    "Paint": ("gradio_components.templates", "Paint"),
    "PlayableVideo": ("gradio_components.templates", "PlayableVideo"),
    "Sketchpad": ("gradio_components.templates", "Sketchpad"),
    "TextArea": ("gradio_components.templates", "TextArea"),
    "Workflow": ("gradio.workflow", "Workflow"),
}


# Submodules that moved to `gradio_components` and are still reachable as `gr.<name>`.
_MOVED_SUBMODULES = (
    "templates",
    "_simple_templates",
    "image_utils",
    "pipelines_utils",
    "interface",
    "chat_interface",
    "external",
    "external_utils",
    "flagging",
    "pipelines",
    "layouts",
)

# Names whose modules import numpy, which core Gradio does without: it comes with
# `gradio[webrtc]` or `gradio[components]`. Each one is loaded on first use.
_NEEDS_NUMPY: dict[str, tuple[str, str | None]] = {
    "streaming": ("gradio.streaming", None),
    "WebRTCOptions": ("gradio.webrtc.options", "WebRTCOptions"),
    "VideoFrame": ("gradio.webrtc.options", "VideoFrame"),
    "AudioChunk": ("gradio.webrtc.options", "AudioChunk"),
}


def _load_needing_numpy(name: str):
    import importlib

    module_name, attribute = _NEEDS_NUMPY[name]
    try:
        module = importlib.import_module(module_name)
    except ModuleNotFoundError as error:
        if error.name != "numpy":
            raise
        raise ImportError(
            f"`gr.{name}` needs numpy. Install it with the `webrtc` extra: "
            'pip install "gradio[webrtc]"'
        ) from error
    value = module if attribute is None else getattr(module, attribute)
    globals()[name] = value
    return value


_components_loaded = False


def _load(name: str):
    import importlib

    module_name, attribute = _NEEDS_COMPONENTS[name]
    _components_package.require(f"`gr.{name}`")
    value = getattr(importlib.import_module(module_name), attribute)
    globals()[name] = value
    return value


def __getattr__(name: str):
    if (
        name in _NEEDS_COMPONENTS or name in _MOVED_SUBMODULES
    ) and not _components_package.is_installed():
        import sys

        raise _components_package.missing_attribute_error(
            f"`gr.{name}`", sys._getframe(1)
        )
    if name in _NEEDS_COMPONENTS:
        return _load(name)
    if name in _MOVED_SUBMODULES:
        import importlib

        _components_package.require(f"`gr.{name}`")
        return importlib.import_module(f"gradio_components.{name}")
    if name in _NEEDS_NUMPY:
        return _load_needing_numpy(name)
    raise AttributeError(f"module 'gradio' has no attribute {name!r}")


def __dir__():
    return sorted(set(globals()) | set(_NEEDS_COMPONENTS) | set(_NEEDS_NUMPY))


def _load_components() -> None:
    """Loads everything that needs `gradio_components`, as Gradio always has: this
    registers every component, so that string shortcuts like "textbox" resolve.
    Runs once: below if `gradio` is imported first, and at the end of
    `import gradio_components` if that is imported first."""
    global _components_loaded  # noqa: PLW0603
    if _components_loaded:
        return
    _components_loaded = True

    import importlib
    import warnings

    for name in _NEEDS_COMPONENTS:
        _load(name)
    # not exported from `gr`, but registered as components and documented
    importlib.import_module("gradio_components._simple_templates")
    # numpy comes with `gradio_components`; loading these registers their docs
    for name in _NEEDS_NUMPY:
        _load_needing_numpy(name)

    # `gradio.components.Textbox` and `from gradio.components import *`, as before
    package = importlib.import_module("gradio_components")
    for name in package.__all__:
        setattr(components, name, getattr(package, name))
    components.__all__ = sorted({*components.__all__, *package.__all__})

    if package.__version__ != get_package_version():
        warnings.warn(
            f"gradio {get_package_version()} is installed with gradio_components "
            f"{package.__version__}. The two are released together and must have the "
            'same version: run `pip install -U "gradio[components]"`.'
        )


# Without `gradio_components`, the names above raise an error that explains how to
# install it.
if _components_package.is_installed() and not _components_package.is_being_imported():
    _load_components()

# this is the version:
__version__ = get_package_version()

__all__ = [
    "Accordion",
    "App",
    "AnnotatedImage",
    "Server",
    "Annotatedimage",
    "Audio",
    "BarPlot",
    "Blocks",
    "BrowserState",
    "Brush",
    "Button",
    "CSVLogger",
    "Cache",
    "cache",
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
    "Component",
    "CopyData",
    "DataFrame",
    "Dataframe",
    "Dataset",
    "DateTime",
    "Dialogue",
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
    "Header",
    "HTML",
    "Highlight",
    "HighlightedText",
    "Highlightedtext",
    "Image",
    "ImageEditor",
    "ImageSlider",
    "ImageMask",
    "Info",
    "InputHTMLAttributes",
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
    "MicrophoneOptions",
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
    "Walkthrough",
    "Step",
    "Warning",
    "WaveformOptions",
    "WebcamOptions",
    "WebRTCOptions",
    "VideoFrame",
    "AudioChunk",
    "WatermarkOptions",
    "__version__",
    "close_all",
    "deploy",
    "get_package_version",
    "I18n",
    "load",
    "load_chat",
    "load_ipython_extension",
    "load_openapi",
    "mount_gradio_app",
    "on",
    "render",
    "set_static_paths",
    "skip",
    "update",
    "DeepLinkButton",
    "mcp",
    "validate",
    "get_audio",
    "get_image",
    "get_video",
    "get_model3d",
    "get_file",
    "validators",
    "Workflow",
    "WorkflowCanvas",
]

if not _components_package.is_installed():
    # so that `from gradio import *` works with core Gradio alone
    __all__ = [name for name in __all__ if name not in _NEEDS_COMPONENTS]  # noqa: PLE0605

if importlib.util.find_spec("numpy") is None:
    # likewise without numpy
    __all__ = [name for name in __all__ if name not in _NEEDS_NUMPY]  # noqa: PLE0605

App = Server
