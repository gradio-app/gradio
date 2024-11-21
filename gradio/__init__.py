import json

import gradio._simple_templates
import gradio.image_utils
import gradio.processing_utils
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
    DataFrame,
    Dataframe,
    Dataset,
    DateTime,
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
from gradio.components.image_editor import Brush, Eraser
from gradio.data_classes import FileData
from gradio.events import (
    CopyData,
    DeletedFileData,
    DownloadData,
    EventData,
    KeyUpData,
    LikeData,
    RetryData,
    SelectData,
    UndoData,
    on,
)
from gradio.exceptions import Error
from gradio.external import load
from gradio.flagging import (
    CSVLogger,
    FlaggingCallback,
    SimpleCSVLogger,
)
from gradio.helpers import (
    Info,
    Progress,
    Warning,
    skip,
    update,
)
from gradio.helpers import create_examples as Examples  # noqa: N812
from gradio.interface import Interface, TabbedInterface, close_all
from gradio.layouts import Accordion, Column, Group, Row, Tab, TabItem, Tabs
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

__version__ = get_package_version()
