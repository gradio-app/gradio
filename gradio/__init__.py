import sys
import importlib
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
        "component"
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
    __name__, submodules=["blocks", "components", "layouts", "themes"], submod_attrs=_submod_attrs
)

__all__ += ["Theme", "Examples"]
__all__ += _templates_attrs
def __getattr__(name):
    if name == "Theme":
        return importlib.import_module("gradio.themes").Base
    if name == "Examples":
        return importlib.import_module("gradio.helpers").create_examples
    if name in _templates_attrs:
        mod = sys.modules[__name__]
        original = getattr(importlib.import_module("gradio.templates"), name)
        setattr(mod, name, original)
        return original

    return __lazy_getattr__(name)
