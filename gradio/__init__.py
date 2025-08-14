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
from gradio.components.image_editor import Brush, Eraser, LayerOptions, WebcamOptions
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
from gradio.external import load, load_chat, load_openapi
from gradio.flagging import (
    CSVLogger,
    FlaggingCallback,
    SimpleCSVLogger,
)
from gradio.helpers import Info, Progress, Success, Warning, skip, update
from gradio.helpers import create_examples as Examples  # noqa: N812
from gradio.i18n import I18n
from gradio.interface import Interface, TabbedInterface, close_all
from gradio.layouts import Accordion, Column, Group, Row, Sidebar, Tab, TabItem, Tabs
from gradio.oauth import OAuthProfile, OAuthToken
from gradio.renderable import render
from gradio.route_utils import Header
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

__version__ = get_package_version()

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
    "IS_WASM",
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
    "load_openapi",
    "mount_gradio_app",
    "on",
    "render",
    "set_static_paths",
    "skip",
    "update",
    "DeepLinkButton",
]


# Define a special attribute name that won't conflict with the mcp.py module
_mcp_proxy_instance = None

def _get_mcp_proxy():
    """Get or create the global MCP proxy instance."""
    global _mcp_proxy_instance
    if _mcp_proxy_instance is None:
        _mcp_proxy_instance = _MCPProxy()
    return _mcp_proxy_instance

class _MCPProxy:
    """A proxy object that provides MCP decorators for the current Blocks context."""
    
    def __init__(self):
        self._pending_registrations = []
    
    def __getattr__(self, name):
        # Get the current Blocks context
        from gradio.context import Context
        current_blocks = Context.block
        if current_blocks is None:
            # Return a deferred decorator that will register when a Blocks context is available
            return self._create_deferred_decorator(name)
        return getattr(current_blocks.mcp, name)
    
    def _create_deferred_decorator(self, decorator_name):
        """Create a decorator that defers registration until a Blocks context is available."""
        def deferred_decorator(*args, **kwargs):
            def decorator(fn):
                # Store the registration for later
                self._pending_registrations.append((decorator_name, args, kwargs, fn))
                return fn
            return decorator
        return deferred_decorator
    
    def _apply_pending_registrations(self, blocks):
        """Apply all pending registrations to a Blocks instance."""
        for decorator_name, args, kwargs, fn in self._pending_registrations:
            decorator_fn = getattr(blocks.mcp, decorator_name)
            # Apply the decorator
            decorator_fn(*args, **kwargs)(fn)
        # Clear pending registrations
        self._pending_registrations.clear()


# Use a property to always return the same proxy instance, 
# even if the mcp.py module gets imported and overwrites the namespace
class _MCPAttribute:
    def __get__(self, obj, type=None):
        return _get_mcp_proxy()

# Create a module-level property descriptor
import sys
class _ModulePropertyMeta(type(sys.modules[__name__])):
    @property 
    def mcp(self):
        return _get_mcp_proxy()

# Replace the module's metaclass to support the property
old_module = sys.modules[__name__]
sys.modules[__name__].__class__ = _ModulePropertyMeta


# Hook into Blocks creation to apply pending MCP registrations
def _patch_blocks_init():
    from gradio.blocks import Blocks
    original_init = Blocks.__init__
    
    def patched_init(self, *args, **kwargs):
        result = original_init(self, *args, **kwargs)
        # Apply any pending MCP registrations from the global mcp proxy
        proxy = _get_mcp_proxy()
        proxy._apply_pending_registrations(self)
        return result
    
    Blocks.__init__ = patched_init

_patch_blocks_init()
