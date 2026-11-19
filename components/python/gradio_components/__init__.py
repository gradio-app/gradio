"""The UI components of Gradio.

Install with `pip install "gradio[components]"` and use through `import gradio as gr`.
"""

import json
from pathlib import Path

from gradio.components.base import (
    Component,
    FormComponent,
    StreamingInput,
    StreamingOutput,
    _Keywords,
    component,
    get_component_instance,
)
from gradio.components.state import State
from gradio.layouts import Form

from gradio_components.annotated_image import AnnotatedImage
from gradio_components.audio import Audio
from gradio_components.browser_state import BrowserState
from gradio_components.button import Button
from gradio_components.chatbot import Chatbot, ChatMessage, MessageDict
from gradio_components.checkbox import Checkbox
from gradio_components.checkboxgroup import CheckboxGroup
from gradio_components.clear_button import ClearButton
from gradio_components.code import Code
from gradio_components.color_picker import ColorPicker
from gradio_components.dataframe import Dataframe
from gradio_components.dataset import Dataset
from gradio_components.datetime import DateTime
from gradio_components.deep_link_button import DeepLinkButton
from gradio_components.dialogue import Dialogue
from gradio_components.download_button import DownloadButton
from gradio_components.dropdown import Dropdown
from gradio_components.duplicate_button import DuplicateButton
from gradio_components.fallback import Fallback
from gradio_components.file import File
from gradio_components.file_explorer import FileExplorer
from gradio_components.gallery import Gallery
from gradio_components.highlighted_text import HighlightedText
from gradio_components.html import HTML
from gradio_components.image import Image
from gradio_components.image_editor import ImageEditor
from gradio_components.imageslider import ImageSlider
from gradio_components.json_component import JSON
from gradio_components.label import Label
from gradio_components.login_button import LoginButton
from gradio_components.markdown import Markdown
from gradio_components.model3d import Model3D
from gradio_components.multimodal_textbox import MultimodalTextbox
from gradio_components.native_plot import BarPlot, LinePlot, NativePlot, ScatterPlot
from gradio_components.navbar import Navbar
from gradio_components.number import Number
from gradio_components.paramviewer import ParamViewer
from gradio_components.plot import Plot
from gradio_components.radio import Radio
from gradio_components.slider import Slider
from gradio_components.textbox import InputHTMLAttributes, Textbox
from gradio_components.timer import Timer
from gradio_components.upload_button import UploadButton
from gradio_components.video import Video
from gradio_components.workflowcanvas import WorkflowCanvas

Text = Textbox
DataFrame = Dataframe
Highlightedtext = HighlightedText
Annotatedimage = AnnotatedImage
Highlight = HighlightedText
Checkboxgroup = CheckboxGroup
Json = JSON

__all__ = [
    "Audio",
    "BarPlot",
    "Button",
    "Chatbot",
    "ChatMessage",
    "ClearButton",
    "Component",
    "component",
    "get_component_instance",
    "_Keywords",
    "Checkbox",
    "CheckboxGroup",
    "Code",
    "ColorPicker",
    "Dataframe",
    "DataFrame",
    "Dataset",
    "Dialogue",
    "DownloadButton",
    "DuplicateButton",
    "Fallback",
    "Form",
    "FormComponent",
    "Gallery",
    "HTML",
    "FileExplorer",
    "Image",
    "JSON",
    "Json",
    "Label",
    "LinePlot",
    "BrowserState",
    "LoginButton",
    "Markdown",
    "MessageDict",
    "Textbox",
    "DateTime",
    "Dropdown",
    "Model3D",
    "File",
    "HighlightedText",
    "AnnotatedImage",
    "CheckboxGroup",
    "Text",
    "Highlightedtext",
    "Annotatedimage",
    "Highlight",
    "Checkboxgroup",
    "Number",
    "Plot",
    "Radio",
    "ScatterPlot",
    "Slider",
    "State",
    "Timer",
    "UploadButton",
    "Video",
    "StreamingInput",
    "StreamingOutput",
    "ImageEditor",
    "ImageSlider",
    "ParamViewer",
    "MultimodalTextbox",
    "Navbar",
    "NativePlot",
    "DeepLinkButton",
    "InputHTMLAttributes",
    "WorkflowCanvas",
]

__version__ = json.loads((Path(__file__).parent / "package.json").read_text())[
    "version"
]

# If this package was imported before `gradio`, then `gradio` could not load the
# templates, layouts and `gr.Blocks` while this module was still running. It can now.
import gradio as _gradio  # noqa: E402

_gradio._load_components()
