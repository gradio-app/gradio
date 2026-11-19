"""Gradio. `pip install gradio` installs the core: the server, the queue, the API
engine and `gr.Server`. The names that build a user interface (`gr.Blocks`,
`gr.Interface` and every component) need the `gradio_components` package, installed
with `pip install "gradio[components]"`; using one without it raises an error that
says so."""

import json
from typing import TYPE_CHECKING

from gradio import _components_package, components, layouts, mcp, themes, validators
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
    from gradio_components.image_editor import (
        Brush,
        Eraser,
        LayerOptions,
        WatermarkOptions,
        WebcamOptions,
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

    from gradio.blocks import Blocks
    from gradio.chat_interface import ChatInterface
    from gradio.external import load, load_chat, load_openapi
    from gradio.flagging import CSVLogger, FlaggingCallback, SimpleCSVLogger
    from gradio.helpers import create_examples as Examples  # noqa: N812
    from gradio.interface import Interface, TabbedInterface, close_all
    from gradio.layouts import (
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
    from gradio.media import get_audio, get_file, get_image, get_model3d, get_video
    from gradio.renderable import render
    from gradio.workflow import Workflow

# Names that need `gradio_components`, and where each one is defined.
_NEEDS_COMPONENTS: dict[str, tuple[str, str]] = {
    "Blocks": ("gradio.blocks", "Blocks"),
    "ChatInterface": ("gradio.chat_interface", "ChatInterface"),
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
    "load": ("gradio.external", "load"),
    "load_chat": ("gradio.external", "load_chat"),
    "load_openapi": ("gradio.external", "load_openapi"),
    "CSVLogger": ("gradio.flagging", "CSVLogger"),
    "FlaggingCallback": ("gradio.flagging", "FlaggingCallback"),
    "SimpleCSVLogger": ("gradio.flagging", "SimpleCSVLogger"),
    "Examples": ("gradio.helpers", "create_examples"),
    "Interface": ("gradio.interface", "Interface"),
    "TabbedInterface": ("gradio.interface", "TabbedInterface"),
    "close_all": ("gradio.interface", "close_all"),
    "Accordion": ("gradio.layouts", "Accordion"),
    "Column": ("gradio.layouts", "Column"),
    "Draggable": ("gradio.layouts", "Draggable"),
    "Group": ("gradio.layouts", "Group"),
    "Row": ("gradio.layouts", "Row"),
    "Sidebar": ("gradio.layouts", "Sidebar"),
    "Step": ("gradio.layouts", "Step"),
    "Tab": ("gradio.layouts", "Tab"),
    "TabItem": ("gradio.layouts", "TabItem"),
    "Tabs": ("gradio.layouts", "Tabs"),
    "Walkthrough": ("gradio.layouts", "Walkthrough"),
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


def _load(name: str):
    import importlib

    module_name, attribute = _NEEDS_COMPONENTS[name]
    _components_package.require(f"`gr.{name}`")
    value = getattr(importlib.import_module(module_name), attribute)
    globals()[name] = value
    return value


def __getattr__(name: str):
    if name in _NEEDS_COMPONENTS:
        return _load(name)
    if name == "templates":
        import importlib

        _components_package.require("`gr.templates`")
        return importlib.import_module("gradio_components.templates")
    raise AttributeError(f"module 'gradio' has no attribute {name!r}")


def __dir__():
    return sorted(set(globals()) | set(_NEEDS_COMPONENTS))


# With `gradio_components` installed, load everything now, as Gradio always has: this
# registers every component, so that string shortcuts like "textbox" resolve. Without
# it, the names above raise an error that explains how to install it.
if _components_package.is_installed() and not _components_package.is_being_imported():
    for _name in _NEEDS_COMPONENTS:
        _load(_name)

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

App = Server
